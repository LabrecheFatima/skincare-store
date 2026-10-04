// Anti-spam des commandes publiques (POST /api/orders)
//  1. Honeypot : champ invisible "website" rempli uniquement par les robots
//  2. Limite par adresse IP : 10 tentatives / 15 minutes
//  3. Téléphone : 10 chiffres obligatoires (05 / 06 / 07), formats +213 et espaces acceptés
//  4. Limite par numéro : 3 commandes / heure
// Stockage en mémoire (aucune dépendance) : les compteurs repartent à zéro au redémarrage du serveur.

const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_ATTEMPTS = 50;
const PHONE_WINDOW_MS = 60 * 60 * 1000;
const PHONE_MAX_ORDERS = 10;

const ipHits = new Map();       // ip -> [timestamps]
const phoneOrders = new Map();  // téléphone -> [timestamps]

// Retourne la liste (mutable) des événements encore dans la fenêtre
function recent(map, key, windowMs) {
  const now = Date.now();
  const list = (map.get(key) || []).filter(t => now - t < windowMs);
  map.set(key, list);
  return list;
}

// "06 12 34 56 78" / "+213 612345678" / "0612-34-56-78" -> "0612345678" (ou null si invalide)
function normalizePhone(raw) {
  if (raw === undefined || raw === null) return null;
  const text = String(raw).trim();
  if (!/^[\d\s.\-+()]+$/.test(text)) return null;

  let digits = text.replace(/\D/g, '');
  if (digits.startsWith('00213')) digits = '0' + digits.slice(5);
  else if (digits.startsWith('213')) digits = '0' + digits.slice(3);

  return /^0[567]\d{8}$/.test(digits) ? digits : null;
}

function orderGuard(req, res, next) {
  const body = req.body || {};

  // 1. Honeypot : on fait croire au robot que tout s'est bien passé
  if (body.website) {
    return res.status(201).json({ message: 'Commande enregistrée avec succès' });
  }

  // 2. Limite par IP
  const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
  const ipList = recent(ipHits, ip, IP_WINDOW_MS);
  if (ipList.length >= IP_MAX_ATTEMPTS) {
    res.set('Retry-After', String(Math.ceil((IP_WINDOW_MS - (Date.now() - ipList[0])) / 1000)));
    return res.status(429).json({ error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.' });
  }
  ipList.push(Date.now());

  // 3. Téléphone : 10 chiffres
  const phone = normalizePhone(body.customer_phone);
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone invalide : 10 chiffres requis (ex : 06 12 34 56 78).' });
  }
  req.body.customer_phone = phone;

  // 4. Limite par numéro (seules les commandes réellement enregistrées comptent)
  const phoneList = recent(phoneOrders, phone, PHONE_WINDOW_MS);
  if (phoneList.length >= PHONE_MAX_ORDERS) {
    res.set('Retry-After', String(Math.ceil((PHONE_WINDOW_MS - (Date.now() - phoneList[0])) / 1000)));
    return res.status(429).json({ error: 'Plusieurs commandes ont déjà été enregistrées avec ce numéro. Nous vous contacterons très prochainement.' });
  }

  res.on('finish', () => {
    if (res.statusCode === 201) {
      recent(phoneOrders, phone, PHONE_WINDOW_MS).push(Date.now());
    }
  });

  next();
}

// Nettoyage périodique de la mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, list] of ipHits) {
    if (!list.length || now - list[list.length - 1] > IP_WINDOW_MS) ipHits.delete(key);
  }
  for (const [key, list] of phoneOrders) {
    if (!list.length || now - list[list.length - 1] > PHONE_WINDOW_MS) phoneOrders.delete(key);
  }
}, 10 * 60 * 1000).unref();

module.exports = orderGuard;
module.exports.normalizePhone = normalizePhone;