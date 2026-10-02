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
      const product = await db('products').where({ id: item.id || item.product_id }).first();
      if (product) {
        const unit_price = product.promo_price ?? product.original_price;
        const qty = item.qty || item.quantity || 1;
        subtotal += unit_price * qty;
        orderItemsToInsert.push({
          product_id: product.id,
          product_name: product.name,
          unit_price,
          quantity: qty,
        });
      }
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
    res.json(orders);
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

      if (status === 'confirmee' && currentOrder.status !== 'confirmee') {
        const items = await trx('order_items').where({ order_id: id });

        for (const item of items) {
          if (item.product_id) {
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