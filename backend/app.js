const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Derrière le proxy cPanel : permet de lire la vraie IP du visiteur (req.ip) pour l'anti-spam
app.set('trust proxy', 1);

// 1. Liste des origines autorisées (Render, cPanel, Vercel, Local)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // URL Vercel ou futur domaine cPanel
].filter(Boolean); // Filtre les valeurs undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // Autorise les requêtes sans origine (comme Postman ou requêtes internes)
    if (!origin) return callback(null, true);
    
    // Si process.env.FRONTEND_URL est mis à '*', on autorise tout
    if (process.env.FRONTEND_URL === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(null, true); // Ou callback(new Error('CORS non autorisé')) si vous voulez bloquer
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend démarré sur le port ${PORT}`));

module.exports = app;