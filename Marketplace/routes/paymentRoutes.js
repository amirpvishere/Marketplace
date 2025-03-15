const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

router.post('/', async (req, res) => {
    try {
        const { userId, cardNumber, paymentMethod, amount, totalPrice } = req.body;

        const cleanCardNumber = cardNumber.replace(/\D/g, '');
        if (cleanCardNumber.length !== 16) {
            return res.status(400).json({ message: "Invalid card number. Must be 16 digits." });
        }

        const amountPaid = parseFloat(amount);
        const total = parseFloat(totalPrice);

        if (paymentMethod === "finance" && amountPaid < total / 12) {
            return res.status(400).json({ message: "Finance requires at least one installment." });
        }
        if (paymentMethod === "cash" && amountPaid < total) {
            return res.status(400).json({ message: "Cash payment must cover the total price." });
        }

        const newOrder = new Order({
            userId,
            cardNumber,
            paymentMethod,
            amountPaid,
            totalPrice: total
        });

        await newOrder.save();

        // CLEAR THE SHOPPING CART
        await Cart.findOneAndDelete({ userId });

        res.redirect(`/orders/${userId}`);
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ message: "Server error while processing payment." });
    }
});

module.exports = router;
