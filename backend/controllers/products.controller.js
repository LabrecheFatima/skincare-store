const db = require('../config/db');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Fonction utilitaire pour traiter et enregistrer une image via formulaire
async function processAndSaveImage(file) {
  const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.webp';
  const outputPath = path.join(__dirname, '..', 'uploads', filename);
  
  await sharp(file.path)
    .resize(800, 800, { fit: 'inside' })
    .webp({ quality: 80 })
    .toFile(outputPath);

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
  return '/uploads/' + filename;
}

// Fonction utilitaire pour normaliser les chemins d'images provenant du CSV/Excel
function normalizeImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  
  let formatted = rawUrl.trim();
  if (!formatted) return null;

  // Ne pas modifier les URLs distantes (ex: http:// ou https://)
  if (formatted.startsWith('http://') || formatted.startsWith('https://')) {
    return formatted;
  }

  // S'assurer que le chemin commence toujours par un '/'
  if (!formatted.startsWith('/')) {
    formatted = '/' + formatted;
  }

  return formatted;
}

exports.getAll = async (req, res) => {
  const { category, minPrice, maxPrice, search, page = 1, limit = 24 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = db('products').where('is_active', 1);
    if (category) query = query.andWhere('category_id', category);
    if (minPrice) query = query.andWhere('original_price', '>=', minPrice);
    if (maxPrice) query = query.andWhere('original_price', '<=', maxPrice);
    if (search) query = query.andWhere('name', 'like', `%${search}%`);

    const totalRes = await query.clone().count('id as count').first();
    const products = await query.clone().limit(limit).offset(offset).select('*');

    // Récupérer les images pour tous les produits
    const productIds = products.map(p => p.id);
    const images = await db('product_images').whereIn('product_id', productIds);

    const productsWithImages = products.map(p => {
      const pImages = images.filter(img => img.product_id === p.id).map(img => img.image_url);
      return {
        ...p,
        images: pImages,
        image_url: pImages[0] || p.image_url || null, // Rétrocompatibilité
        final_price: p.promo_price ?? p.original_price,
        has_promo: p.promo_price !== null && p.promo_price !== undefined,
      };
    });

    res.json({
      data: productsWithImages,
      pagination: { page: Number(page), limit: Number(limit), total: totalRes.count || totalRes['count'] },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [ADMIN] Liste paginée (inclut les produits masqués) avec recherche et filtre "à réapprovisionner"
exports.getAllAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { search } = req.query;
    const lowStockOnly = req.query.low_stock === '1' || req.query.low_stock === 'true';

    let query = db('products');
    if (search && String(search).trim()) {
      const like = `%${String(search).trim()}%`;
      query = query.where(function () {
        this.where('name', 'like', like).orWhere('slug', 'like', like);
      });
    }
    if (lowStockOnly) query = query.where('stock_quantity', '<', 0);

    const totalRow = await query.clone().count({ count: '*' }).first();
    const total = Number(totalRow.count);

    // Nombre total de produits à réapprovisionner (pour le badge du filtre)
    const lowRow = await db('products').where('stock_quantity', '<', 0).count({ count: '*' }).first();

    const products = await query.clone().orderBy('id', 'desc').limit(limit).offset((page - 1) * limit).select('*');

    const productIds = products.map(p => p.id);
    const images = productIds.length > 0 ? await db('product_images').whereIn('product_id', productIds) : [];

    const data = products.map(p => {
      const pImages = images.filter(img => img.product_id === p.id).map(img => img.image_url);
      return {
        ...p,
        images: pImages,
        image_url: pImages[0] || p.image_url || null,
        final_price: p.promo_price ?? p.original_price,
        has_promo: p.promo_price !== null && p.promo_price !== undefined,
      };
    });

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
      low_stock_count: Number(lowRow.count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const product = await db('products').where({ slug: req.params.slug, is_active: 1 }).first();
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    const images = await db('product_images').where({ product_id: product.id }).select('image_url');
    const imageUrls = images.map(img => img.image_url);

    res.json({
      ...product,
      images: imageUrls,
      image_url: imageUrls[0] || product.image_url || null,
      final_price: product.promo_price ?? product.original_price,
      has_promo: product.promo_price !== null && product.promo_price !== undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { category_id, name, slug, description, composition, conseil_utilisation, original_price, promo_price, stock_quantity } = req.body;

  try {
    // 1. Insertion du produit
    const [productId] = await db('products').insert({
      category_id: category_id || null,
      name,
      slug,
      description: description || '',
      composition: composition || '',                  
      conseil_utilisation: conseil_utilisation || '',
      original_price,
      promo_price: promo_price ? Number(promo_price) : null,
      stock_quantity: stock_quantity || 0,
      is_active: 1
    });

    // 2. Traitement des images multiples (req.files)
    if (req.files && req.files.length > 0) {
      const imageRecords = [];
      for (const file of req.files) {
        const imageUrl = await processAndSaveImage(file);
        imageRecords.push({ product_id: productId, image_url: imageUrl });
      }
      await db('product_images').insert(imageRecords);

      // Mettre à jour l'image principale sur le produit
      await db('products').where({ id: productId }).update({ image_url: imageRecords[0].image_url });
    }

    res.status(201).json({ id: productId, message: 'Produit créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, slug, description, conseil_utilisation, composition, original_price, promo_price, stock_quantity, is_active, delete_images } = req.body;

  try {
    const updateData = {
      category_id: category_id || null,
      name,
      slug,
      description,
      composition: composition || '',                   
      conseil_utilisation: conseil_utilisation || '',
      original_price,
      promo_price: promo_price ? Number(promo_price) : null,
      stock_quantity,
      is_active
    };

    await db('products').where({ id }).update(updateData);

    // 1. Supprimer les images demandées
    if (delete_images) {
      const imagesToDelete = typeof delete_images === 'string' ? JSON.parse(delete_images) : delete_images;
      if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
        await db('product_images').where({ product_id: id }).whereIn('image_url', imagesToDelete).del();
      }
    }

    // 2. Ajouter les nouvelles images
    if (req.files && req.files.length > 0) {
      const imageRecords = [];
      for (const file of req.files) {
        const imageUrl = await processAndSaveImage(file);
        imageRecords.push({ product_id: id, image_url: imageUrl });
      }
      await db('product_images').insert(imageRecords);
    }

    // 3. Mettre à jour l'image principale du produit
    const firstImg = await db('product_images').where({ product_id: id }).first();
    await db('products').where({ id }).update({ image_url: firstImg ? firstImg.image_url : null });

    res.json({ message: 'Produit mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Supprimer les images associées
    await db('product_images').where({ product_id: id }).del();
    
    // 2. Supprimer le produit
    const deletedRows = await db('products').where({ id }).del();

    if (!deletedRows) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Importation en masse de produits depuis un tableau JSON (CSV/Excel)
exports.bulkImport = async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Aucun produit valide n\'a été fourni.' });
  }

  try {
    const insertedProducts = [];

    // 1. Récupérer les IDs de catégories existantes pour éviter les erreurs de clé étrangère
    const existingCategories = await db('categories').select('id');
    const validCategoryIds = new Set(existingCategories.map(c => c.id));

    // 2. Transaction SQL
    await db.transaction(async (trx) => {
      for (const item of products) {
        // Ignorer les lignes sans nom ou sans prix
        if (!item.name || item.original_price === undefined || item.original_price === null) {
          continue;
        }

        // Valider l'ID de catégorie
        const categoryId = item.category_id && validCategoryIds.has(Number(item.category_id))
          ? Number(item.category_id)
          : null;

        // Générer un slug unique avec horodatage pour éviter les erreurs de doublon
        const baseSlug = (item.slug || item.name)
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Traitement et nettoyage du chemin de l'image issue du CSV
        const rawImg = item.image_url || item.image || item.images || null;
        const formattedImageUrl = normalizeImageUrl(rawImg);

        // Insertion du produit
        const [productId] = await trx('products').insert({
          category_id: categoryId,
          name: item.name,
          slug: uniqueSlug,
          description: item.description || '',
          composition: item.composition || '',
          conseil_utilisation: item.conseil_utilisation || '',
          original_price: Number(item.original_price),
          promo_price: item.promo_price ? Number(item.promo_price) : null,
          stock_quantity: item.stock_quantity ? Number(item.stock_quantity) : 0,
          image_url: formattedImageUrl,
          is_active: item.is_active !== undefined ? Number(item.is_active) : 1
        });

        // Insertion de l'image dans product_images si présente
        if (formattedImageUrl) {
          await trx('product_images').insert({
            product_id: productId,
            image_url: formattedImageUrl
          });
        }

        insertedProducts.push(productId);
      }
    });

    return res.status(201).json({
      message: `${insertedProducts.length} produit(s) importé(s) avec succès.`,
      count: insertedProducts.length
    });
  } catch (err) {
    console.error('Erreur détails bulkImport:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de l\'importation : ' + err.message });
  }
};