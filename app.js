require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const MongoStore=require('connect-mongo')
const fileupload = require('express-fileupload');
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { v4: uuidv4 } = require('uuid');
const indexRouter = require('./routes/indexRouter');
const PORT = process.env.PORT || 3001;
const app = express();
require('./models/config');

// CORS configuration
const corsOptions = {
    origin:true,
    credentials: true
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: true,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SECRET,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        sameSite: 'none'
    }
}));
app.use(logger('tiny'));
app.use(fileupload());

// Routes
app.get('/', (req, res) => {
    res.send('Hello');
});

app.use('/user', indexRouter);
app.get("/api/getkey", (req, res) =>
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

app.all("*", (req, res, next) => {
    res.status(404).send('404 - Not Found');
});


// Server listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
