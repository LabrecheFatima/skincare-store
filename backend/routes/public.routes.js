const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const categoriesController = require('../controllers/categories.controller');
const ordersController = require('../controllers/orders.controller');
const shippingController = require('../controllers/shipping.controller');
const packsController = require('../controllers/packs.controller');
const orderGuard = require('../middlewares/orderGuard');

router.get('/products', productsController.getAll);
router.get('/products/:slug', productsController.getBySlug);
router.get('/categories', categoriesController.getAll);
router.post('/orders', orderGuard, ordersController.create);
router.get('/shipping-rates', shippingController.getShippingInfo);
router.get('/packs', packsController.getAll);
router.get('/packs/:slug', packsController.getOne);

module.exports = router;