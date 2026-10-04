const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const categories = await db('categories').select('*');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, slug, usage_method } = req.body;
  try {
    const [id] = await db('categories').insert({
      name,
      slug,
      usage_method: usage_method || null
    });
    res.status(201).json({ id, name, slug, usage_method: usage_method || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, slug, usage_method } = req.body;
  try {
    await db('categories').where({ id }).update({
      name,
      slug,
      usage_method: usage_method || null
    });
    res.json({ message: 'Catégorie mise à jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    // Détacher les produits et les packs de cette catégorie avant de la supprimer
    await db('products').where({ category_id: id }).update({ category_id: null });
    await db('packs').where({ category_id: id }).update({ category_id: null }).catch(() => {});

    await db('categories').where({ id }).del();
    res.json({ message: 'Catégorie supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};