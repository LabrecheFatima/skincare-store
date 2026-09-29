const db = require('../config/db');

// Récupérer la configuration globale + liste des wilayas actives pour le site public
exports.getShippingInfo = async (req, res) => {
  try {
    const setting = await db('settings').where({ key: 'shipping_enabled' }).first();
    const enabled = setting ? setting.value === 'true' : false;

    const rates = await db('shipping_rates').where({ is_active: true }).orderBy('wilaya_name', 'asc');

    res.json({
      shipping_enabled: enabled,
      rates
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [ADMIN] Basculer le Toggle ON/OFF global
exports.toggleShipping = async (req, res) => {
  const { enabled } = req.body;
  try {
    const valueStr = enabled ? 'true' : 'false';
    const exists = await db('settings').where({ key: 'shipping_enabled' }).first();

    if (exists) {
      await db('settings').where({ key: 'shipping_enabled' }).update({ value: valueStr });
    } else {
      await db('settings').insert({ key: 'shipping_enabled', value: valueStr });
    }

    res.json({ shipping_enabled: enabled, message: `Livraison par wilaya : ${enabled ? 'Activée' : 'Désactivée'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [ADMIN] Récupérer tous les tarifs (actifs et inactifs)
exports.getAllRates = async (req, res) => {
  try {
    const rates = await db('shipping_rates').orderBy('wilaya_name', 'asc');
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [ADMIN] Ajouter ou Mettre à jour un tarif de Wilaya (Upsert)
exports.saveRate = async (req, res) => {
  const { wilaya_name, price, is_active } = req.body;

  if (!wilaya_name) {
    return res.status(400).json({ error: 'Nom de la wilaya requis' });
  }

  try {
    const existing = await db('shipping_rates').where({ wilaya_name }).first();

    if (existing) {
      await db('shipping_rates').where({ wilaya_name }).update({
        price: Number(price) || 0,
        is_active: is_active !== undefined ? is_active : true
      });
      res.json({ message: 'Tarif mis à jour' });
    } else {
      const [id] = await db('shipping_rates').insert({
        wilaya_name,
        price: Number(price) || 0,
        is_active: is_active !== undefined ? is_active : true
      });
      res.status(201).json({ id, message: 'Tarif ajouté' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [ADMIN] Supprimer un tarif
exports.deleteRate = async (req, res) => {
  const { id } = req.params;
  try {
    await db('shipping_rates').where({ id }).del();
    res.json({ message: 'Tarif supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};