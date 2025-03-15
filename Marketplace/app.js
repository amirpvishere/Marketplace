require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const viewRoutes = require('./routes/views');
const productRoutes = require('./routes/productRoutes'); 
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = process.env.port || 3000;


// DEFINING THE ROUTES TO VIEWS
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));


// CONNECT TO DATABASE
MONGODB_USERNAME = process.env.MONGODB_USERNAME
MONGODB_PASSWORD = process.env.MONGODB_PASSWORD
const mongoURI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.p2q2e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully!');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
});


// DEFINING THE EJS
app.set('view engine', 'ejs');

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// SESSION CONFIGURATION
app.use(session({
    secret: 'my_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURI }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));


// MIDDLEWARE
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ROUTES
app.use('/api/auth', authRoutes.router);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/process-payment', paymentRoutes);
app.use('/orders', orderRoutes);
app.use('/', viewRoutes); 


// REGISTER GET
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null })
})


// REGISTER POST
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, age, country, phone } = req.body;

        if (!username || !password || !phone) {
            return res.status(400).send("Username, password, and phone are required.");
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send("User Already Exist.")
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            username,
            email: email || "",
            password: hashedPassword,
            age, 
            country, 
            phone,
        });

        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error: ', error);
        res.status(500).send('Internal Server Error')
    }
});


// LOGIN GET
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});


// LOGIN POST
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.username = user.username;
            res.redirect('/');
        } else {
            res.render('login', { errorMessage: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).send('Internal Server error');
    }
});


// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/')
    })
})

// GETTING THE PRODUCTS
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Failed to fetch products: ', error);
        res.status(500).send('Failed to fetch products')
    }
})


// ADDING A PRODUCT
app.post('/add-product', async (req, res) => {
    try {
        const { name, description, price, inStock } = req.body;
        const stockCount = parseInt(inStock, 10);
        
        if (!name || !description || !price || isNaN(stockCount) || stockCount < 0) {
            return res.status(400).json({ message: 'Name, description, and price are required' });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            inStock: parseInt(inStock, 10) 
        });

        await newProduct.save();
        res.redirect('/'); 
    } catch (error) {
        console.error('Error adding product: ', error);
        res.status(500).json({ message: 'Error adding product.' });
    }
});


// CHECKOUT
app.get('/checkout', (req, res) => {
    let { userId, totalPrice } = req.query;
    totalPrice = parseFloat(totalPrice);

    if (isNaN(totalPrice)) {
        return res.status(400).send("Invalid total price.");
    }

    res.render('checkout', { userId, totalPrice });
});


app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users); 
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).send('Failed to fetch users');
    }
});


// Start the server
app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
)
