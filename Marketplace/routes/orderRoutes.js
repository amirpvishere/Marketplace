const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');


router.post('/checkout', async (req, res) => {
    try {
        const { userId, cardNumber, paymentMethod, amountPaid } = req.body;

        const cart = await Cart.findOne({ userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = cart.items.map(item => {
            totalAmount += item.product.price * item.quantity;
            return { product: item.product._id, quantity: item.quantity };
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100,
            currency: "usd",
            payment_method_types: ["card"],
        });

        if (!paymentIntent) {
            return res.status(500).json({ message: "Payment failed" });
        }

        const order = new Order({
            userId,
            items: orderItems,
            paymentMethod,
            amountPaid,
            totalPrice: totalAmount,
            createdAt: new Date()
        });
        await order.save();

        await Cart.findOneAndDelete({ userId });


        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { inStock: -item.quantity } });
        }

        res.json({ message: "Order placed successfully!", paymentIntent });

    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ message: "Error processing checkout" });
    }
});

router.get('/order-status/:orderId', async (req, res) => {
    try {
        const response = await axios.get(`https://api.example.com/orders/${req.params.orderId}`, {
            headers: { 'Authorization': `Bearer ${process.env.ORDER_API_KEY}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching order status:", error);
        res.status(500).json({ message: "Failed to fetch order status" });
    }
});

router.put('/cancel/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const now = new Date();
        const orderTime = new Date(order.createdAt);
        const sixHours = 6 * 60 * 60 * 1000;

        if (!order.createdAt || (now - orderTime >= sixHours) || order.status === "completed") {
            return res.status(400).json({ message: "Order cannot be cancelled." });
        }

        order.status = "cancelled";
        await order.save();

        res.json({ message: "Order cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: "Server error while cancelling order" });
    }
});

module.exports = router;
