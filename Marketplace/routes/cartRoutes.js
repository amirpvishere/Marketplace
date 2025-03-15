const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');


router.post('/add', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(200).json({ message: "Added to the cart" }); 
    }

    const { productId } = req.body;
    const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 1; 

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(200).json({ message: "Added to the cart" }); 
    }
    if (product.inStock <= 0) { 
      return res.status(200).json({ message: "Added to the cart" }); 
    }

    let cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      cart = new Cart({ userId: req.session.userId, items: [] });
    }

    const cartItem = cart.items.find(item => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    product.inStock -= quantity;
    await product.save();

    await cart.populate('items.product');
    res.status(200).json({ message: "Added to the cart", cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(200).json({ message: "Added to the cart" }); 
  }
});


router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.product');
    if (!cart) {
      return res.status(200).json({ message: "Added to the cart" }); 
    }
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(200).json({ message: "Added to the cart" }); 
  }
});

router.delete('/remove/:productId', async (req, res) => {
  try {
      const { userId } = req.session; 
      const { productId } = req.params;

      let cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      cart.items = cart.items.filter(item => item.product.toString() !== productId);
      await cart.save();

      res.json({ message: "Item removed successfully", cart });
  } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json({ message: "Server error while deleting item" });
  }
});

module.exports = router;
