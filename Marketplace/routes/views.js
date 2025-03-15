const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

router.get('/', async (req, res) => {
    try {
        let products = await Product.find();

        // SORTING THE ITEMS IN THE HOMEPAGE
        products.sort((a, b) => (b.inStock > 0) - (a.inStock > 0));

        res.render('index', { products, session: req.session || {} });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error loading products");
    }
});

router.get('/cart/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.product');
        res.render('cart', { cart });
    } catch (error) {
        res.status(500).send("Error loading cart");
    }
});

router.get('/orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('items.product').sort({ createdAt: -1 });
        res.render('orders', { orders });
    } catch (error) {
        res.status(500).send("Error loading orders");
    }
});

module.exports = router;
