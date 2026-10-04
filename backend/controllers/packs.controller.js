const db = require('../config/db');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Stock : accepte 0 et les valeurs négatives (10 uniquement si la valeur est absente/invalide)
const parseStock = (v) => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? 10 : Number(v);

// Fonction utilitaire pour traiter et enregistrer une image WebP
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

// Récupérer tous les packs avec leurs produits inclus et leurs images
exports.getAll = async (req, res) => {
  try {
    const packs = await db('packs').select('*');
    if (packs.length === 0) return res.json([]);

    const packIds = packs.map(p => p.id);

    // Produits inclus dans chaque pack via pack_items
    const items = await db('pack_items')
      .join('products', 'pack_items.product_id', 'products.id')
      .whereIn('pack_items.pack_id', packIds)
      .select(
        'pack_items.pack_id',
        'products.id as id',
        'products.id as product_id',
        'products.name',
        'products.original_price',
        'products.image_url',
        'pack_items.quantity'
      );

    // Images de chaque pack
    const packImages = await db('pack_images')
      .whereIn('pack_id', packIds)
      .catch(() => []);

    const result = packs.map(pack => {
      const images = packImages
        .filter(img => img.pack_id === pack.id)
        .map(img => img.image_url);

      return {
        ...pack,
        products: items.filter(item => item.pack_id === pack.id),
        images: images,
        image_url: images[0] || pack.image_url || null
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Créer un nouveau pack
exports.create = async (req, res) => {
  const { name, slug, description, original_price, promo_price, stock_quantity, is_active, products, items } = req.body;

  let rawProducts = products || items || [];
  if (typeof rawProducts === 'string') {
    try {
      rawProducts = JSON.parse(rawProducts);
    } catch (e) {
      rawProducts = [];
    }
  }

  try {
    // 1. Insertion du pack
    const [packId] = await db('packs').insert({
      name,
      slug,
      description: description || '',
      original_price: Number(original_price) || 0,
      promo_price: promo_price ? Number(promo_price) : null,
      stock_quantity: parseStock(stock_quantity),
      is_active: is_active !== undefined ? Number(is_active) : 1
    });

    // 2. Insertion dans pack_items
    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      const packProductsRecords = rawProducts.map(item => ({
        pack_id: packId,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1
      }));
      await db('pack_items').insert(packProductsRecords);
    }

    // 3. Traitement des images envoyées
    if (req.files && req.files.length > 0) {
      const imageRecords = [];
      for (const file of req.files) {
        const imageUrl = await processAndSaveImage(file);
        imageRecords.push({ pack_id: packId, image_url: imageUrl });
      }

      await db('pack_images').insert(imageRecords).catch(() => {});
      await db('packs').where({ id: packId }).update({ image_url: imageRecords[0].image_url }).catch(() => {});
    }

    res.status(201).json({ id: packId, message: 'Pack créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un pack
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, original_price, promo_price, stock_quantity, is_active, products, items, delete_images } = req.body;

  let rawProducts = products || items;
  if (typeof rawProducts === 'string') {
    try {
      rawProducts = JSON.parse(rawProducts);
    } catch (e) {
      rawProducts = null;
    }
  }

  try {
    // 1. Mise à jour de la table packs
    await db('packs').where({ id }).update({
      name,
      slug,
      description: description || '',
      original_price: Number(original_price) || 0,
      promo_price: promo_price ? Number(promo_price) : null,
      stock_quantity: parseStock(stock_quantity),
      is_active: is_active !== undefined ? Number(is_active) : 1
    });

    // 2. Mise à jour des articles dans pack_items
    if (rawProducts && Array.isArray(rawProducts)) {
      await db('pack_items').where({ pack_id: id }).del();
      if (rawProducts.length > 0) {
        const packProductsRecords = rawProducts.map(item => ({
          pack_id: id,
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1
        }));
        await db('pack_items').insert(packProductsRecords);
      }
    }

    // 3. Suppression d'images
    if (delete_images) {
      let imgsToDelete = typeof delete_images === 'string' ? JSON.parse(delete_images) : delete_images;
      if (Array.isArray(imgsToDelete) && imgsToDelete.length > 0) {
        await db('pack_images').where({ pack_id: id }).whereIn('image_url', imgsToDelete).del().catch(() => {});
      }
    }

    // 4. Ajout de nouvelles images
    if (req.files && req.files.length > 0) {
      const imageRecords = [];
      for (const file of req.files) {
        const imageUrl = await processAndSaveImage(file);
        imageRecords.push({ pack_id: id, image_url: imageUrl });
      }
      await db('pack_images').insert(imageRecords).catch(() => {});
      
      const firstImg = await db('pack_images').where({ pack_id: id }).first().catch(() => null);
      if (firstImg) {
        await db('packs').where({ id }).update({ image_url: firstImg.image_url }).catch(() => {});
      }
    }

    res.json({ message: 'Pack mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un pack par son ID ou son Slug
exports.getOne = async (req, res) => {
  const identifier = req.params.slug || req.params.id;

  try {
    if (!identifier) {
      return res.status(400).json({ error: 'Identifiant du pack requis' });
    }

    // 1. Recherche du pack par ID ou par Slug
    const isNum = /^\d+$/.test(identifier);
    const pack = await db('packs')
      .where(isNum ? { id: Number(identifier) } : { slug: identifier })
      .first();

    if (!pack) {
      return res.status(404).json({ error: 'Pack non trouvé' });
    }

    // 2. Récupération des produits inclus
    let items = [];
    try {
      items = await db('pack_items')
        .join('products', 'pack_items.product_id', 'products.id')
        .where('pack_items.pack_id', pack.id)
        .select(
          'products.id as product_id',
          'products.name',
          'products.slug as product_slug',
          'products.original_price',
          'products.promo_price',
          'products.image_url',
          'pack_items.quantity'
        );
    } catch (itemErr) {
      console.error('Erreur récupération pack_items :', itemErr.message);
    }

    // 3. Récupération des images secondaires
    let packImages = [];
    try {
      packImages = await db('pack_images')
        .where({ pack_id: pack.id });
    } catch (imgErr) {
      console.error('Erreur récupération pack_images :', imgErr.message);
    }

    const imagesList = Array.isArray(packImages)
      ? packImages.map(img => img.image_url).filter(Boolean)
      : [];

    // Ajouter l'image principale si la galerie est vide
    if (imagesList.length === 0 && pack.image_url) {
      imagesList.push(pack.image_url);
    }

    res.json({
      ...pack,
      products: items || [],
      images: imagesList,
      image_url: pack.image_url || imagesList[0] || null
    });
  } catch (err) {
    console.error('Erreur serveur getOne Pack :', err);
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un pack
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await db('pack_items').where({ pack_id: id }).del();
    await db('pack_images').where({ pack_id: id }).del().catch(() => {});
    await db('packs').where({ id }).del();

    res.json({ message: 'Pack supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};