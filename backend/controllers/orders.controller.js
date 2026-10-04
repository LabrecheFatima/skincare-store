const db = require('../config/db');

exports.create = async (req, res) => {
  const { customer_first_name, customer_last_name, customer_phone, wilaya, commune, delivery_address, items, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide' });
  }
  if (items.length > 30) {
    return res.status(400).json({ error: 'Panier trop volumineux' });
  }

  try {
    let subtotal = 0;
    const orderItemsToInsert = [];

    // 1. Calculer le sous-total des produits
    for (const item of items) {
      const itemId = item.id || item.product_id;
      const qty = Math.min(Math.max(parseInt(item.qty || item.quantity, 10) || 1, 1), 99);
      const isPack = Boolean(item.isPack || item.is_pack || item.item_type === 'pack');

      // --- Cas d'un PACK : on lit la table "packs" (et non "products") ---
      if (isPack) {
        const pack = await db('packs').where({ id: itemId }).first();
        if (pack) {
          const unit_price = Number(pack.promo_price) > 0 ? Number(pack.promo_price) : Number(pack.original_price);
          subtotal += unit_price * qty;
          orderItemsToInsert.push({
            product_id: null,
            pack_id: pack.id,
            item_type: 'pack',
            product_name: pack.name,
            unit_price,
            quantity: qty,
          });
        }
        continue;
      }

      // --- Cas d'un PRODUIT ---
      const product = await db('products').where({ id: itemId }).first();
      if (product) {
        const unit_price = Number(product.promo_price ?? product.original_price);
        subtotal += unit_price * qty;
        orderItemsToInsert.push({
          product_id: product.id,
          pack_id: null,
          item_type: 'product',
          product_name: product.name,
          unit_price,
          quantity: qty,
        });
      }
    }

    if (orderItemsToInsert.length === 0) {
      return res.status(400).json({ error: 'Aucun article valide dans le panier' });
    }

    // 2. Calculer les frais de livraison si l'option est activée
    let shipping_cost = 0;
    const setting = await db('settings').where({ key: 'shipping_enabled' }).first();
    const isShippingEnabled = setting ? setting.value === 'true' : false;

    if (isShippingEnabled && wilaya) {
      const rateObj = await db('shipping_rates').where({ wilaya_name: wilaya, is_active: true }).first();
      if (rateObj) {
        shipping_cost = Number(rateObj.price);
      }
    }

    const total_amount = subtotal + shipping_cost;

    // 3. Insérer la commande avec les frais distincts
    const [order_id] = await db('orders').insert({
      customer_first_name,
      customer_last_name,
      customer_phone,
      wilaya,
      commune: commune || '',
      delivery_address,
      shipping_cost,
      total_amount,
      notes: notes || null,
      status: 'en_attente'
    });

    const itemsWithOrderId = orderItemsToInsert.map(i => ({ ...i, order_id }));
    await db('order_items').insert(itemsWithOrderId);

    res.status(201).json({ order_id, total_amount, shipping_cost, message: 'Commande enregistrée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    // Sans paramètre "page" : liste complète (compatibilité, ex : tableau de bord)
    const paginated = req.query.page !== undefined;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const sortKey = ['id', 'total_amount'].includes(req.query.sort) ? req.query.sort : 'id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';

    let orders;
    let total = 0;

    if (paginated) {
      let query = db('orders');

      const { status, search } = req.query;
      if (status && status !== 'ALL') query = query.where('status', status);

      // Recherche : chaque mot doit correspondre au nom, prénom, téléphone, wilaya ou n° de commande
      if (search && String(search).trim()) {
        const terms = String(search).trim().split(/\s+/).slice(0, 5);
        for (const term of terms) {
          const like = `%${term}%`;
          query = query.where(function () {
            this.where('customer_first_name', 'like', like)
              .orWhere('customer_last_name', 'like', like)
              .orWhere('customer_phone', 'like', like)
              .orWhere('wilaya', 'like', like);
            if (/^\d+$/.test(term)) this.orWhere('id', Number(term));
          });
        }
      }

      const totalRow = await query.clone().count({ count: '*' }).first();
      total = Number(totalRow.count);

      let listQuery = query.clone().orderBy(sortKey, sortDir);
      if (sortKey !== 'id') listQuery = listQuery.orderBy('id', 'desc');
      orders = await listQuery.limit(limit).offset((page - 1) * limit).select('*');
    } else {
      orders = await db('orders').select('*').orderBy('id', 'desc');
    }

    let result = [];
    if (orders.length > 0) {
      // Articles (produits ET packs) des commandes de la page
      const orderItems = await db('order_items').whereIn('order_id', orders.map(o => o.id));

      // Contenu des packs commandés (pour l'affichage dans le tableau admin)
      const packIds = [...new Set(orderItems.filter(i => i.item_type === 'pack' && i.pack_id).map(i => i.pack_id))];
      let packContents = [];
      if (packIds.length > 0) {
        packContents = await db('pack_items')
          .join('products', 'pack_items.product_id', 'products.id')
          .whereIn('pack_items.pack_id', packIds)
          .select('pack_items.pack_id', 'products.name', 'pack_items.quantity');
      }

      result = orders.map(order => ({
        ...order,
        items: orderItems
          .filter(i => i.order_id === order.id)
          .map(i => i.item_type === 'pack'
            ? { ...i, pack_products: packContents.filter(p => p.pack_id === i.pack_id) }
            : i),
      }));
    }

    if (!paginated) return res.json(result);

    res.json({
      data: result,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.transaction(async (trx) => {
      const currentOrder = await trx('orders').where({ id }).first();
      if (!currentOrder) throw new Error('Commande non trouvée');

      // ---- GESTION DU STOCK (produits ET packs : même règle) ----
      // Le stock est "consommé" tant que la commande est confirmée, expédiée ou livrée.
      // - on le retire quand on PASSE à un de ces statuts (ex: en_attente -> confirmee)
      // - on le RESTITUE quand on les QUITTE (ex: confirmee -> annulee)
      // Le stock peut devenir négatif (ex: -3 = 3 unités à réapprovisionner) : aucun blocage.
      const STOCK_STATUSES = ['confirmee', 'expediee', 'livree'];
      const wasConsumed = STOCK_STATUSES.includes(currentOrder.status);
      const willBeConsumed = STOCK_STATUSES.includes(status);
      const consume = !wasConsumed && willBeConsumed;
      const restore = wasConsumed && !willBeConsumed;

      if (consume || restore) {
        const items = await trx('order_items').where({ order_id: id });

        for (const item of items) {
          const isPack = item.item_type === 'pack';
          const table = isPack ? 'packs' : 'products';
          const refId = isPack ? item.pack_id : item.product_id;
          if (!refId) continue; // produit/pack supprimé entre-temps

          if (consume) {
            await trx(table).where({ id: refId }).decrement('stock_quantity', item.quantity);
          } else {
            await trx(table).where({ id: refId }).increment('stock_quantity', item.quantity);
          }
        }
      }

      await trx('orders').where({ id }).update({ status });
    });

    res.json({ message: `Statut de la commande #${id} mis à jour : ${status}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une commande
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    await db.transaction(async (trx) => {
      // 1. Supprimer d'abord les articles de la commande (clé étrangère)
      await trx('order_items').where({ order_id: id }).del();
      
      // 2. Supprimer la commande
      const deleted = await trx('orders').where({ id }).del();

      if (!deleted) {
        throw new Error('Commande non trouvée');
      }
    });

    res.json({ message: `Commande #${id} supprimée avec succès` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Modifier les informations d'une commande (nom, téléphone, adresse, etc.)
exports.updateDetails = async (req, res) => {
  const { id } = req.params;
  const { customer_first_name, customer_last_name, customer_phone, wilaya, commune, delivery_address, notes } = req.body;

  try {
    const updated = await db('orders')
      .where({ id })
      .update({
        customer_first_name,
        customer_last_name,
        customer_phone,
        wilaya,
        commune,
        delivery_address,
        notes
      });

    if (!updated) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ message: `Commande #${id} mise à jour avec succès` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};