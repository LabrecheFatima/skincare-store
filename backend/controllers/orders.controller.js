const db = require('../config/db');

exports.create = async (req, res) => {
  const { customer_first_name, customer_last_name, customer_phone, wilaya, commune, delivery_address, items, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide' });
  }

  try {
    let subtotal = 0;
    const orderItemsToInsert = [];

    // 1. Calculer le sous-total des produits
    for (const item of items) {
      const itemId = item.id || item.product_id;
      const qty = item.qty || item.quantity || 1;
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
    const orders = await db('orders').select('*').orderBy('id', 'desc');
    if (orders.length === 0) return res.json([]);

    // Articles (produits ET packs) de toutes les commandes
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

    const result = orders.map(order => ({
      ...order,
      items: orderItems
        .filter(i => i.order_id === order.id)
        .map(i => i.item_type === 'pack'
          ? { ...i, pack_products: packContents.filter(p => p.pack_id === i.pack_id) }
          : i),
    }));

    res.json(result);
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

      // ---- PACKS ----
      // Le stock d'un pack est "consommé" dès que la commande est confirmée, expédiée ou livrée.
      // - on le retire quand on PASSE à un statut consommant (ex: en_attente -> confirmee)
      // - on le RESTITUE quand on QUITTE ces statuts (ex: confirmee -> annulee)
      // Le stock d'un pack peut devenir négatif (ex: -3 = 3 packs à réapprovisionner).
      const PACK_STOCK_STATUSES = ['confirmee', 'expediee', 'livree'];
      const packWasConsumed = PACK_STOCK_STATUSES.includes(currentOrder.status);
      const packWillBeConsumed = PACK_STOCK_STATUSES.includes(status);
      const consumePacks = !packWasConsumed && packWillBeConsumed;
      const restorePacks = packWasConsumed && !packWillBeConsumed;

      // ---- PRODUITS (logique inchangée) ----
      const consumeProducts = status === 'confirmee' && currentOrder.status !== 'confirmee';

      if (consumePacks || restorePacks || consumeProducts) {
        const items = await trx('order_items').where({ order_id: id });

        for (const item of items) {
          // --- Pack ---
          if (item.item_type === 'pack') {
            if (!item.pack_id) continue; // pack supprimé entre-temps

            if (consumePacks) {
              await trx('packs').where({ id: item.pack_id }).decrement('stock_quantity', item.quantity);
            } else if (restorePacks) {
              await trx('packs').where({ id: item.pack_id }).increment('stock_quantity', item.quantity);
            }
            continue;
          }

          // --- Produit ---
          if (consumeProducts && item.product_id) {
            const product = await trx('products').where({ id: item.product_id }).first();
            if (!product) throw new Error(`Produit #${item.product_id} introuvable`);

            if (product.stock_quantity < item.quantity) {
              throw new Error(`Stock insuffisant pour "${product.name}" (Stock: ${product.stock_quantity}, Demandé: ${item.quantity})`);
            }

            await trx('products').where({ id: item.product_id }).decrement('stock_quantity', item.quantity);
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