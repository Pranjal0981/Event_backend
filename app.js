require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const MongoStore=require('connect-mongo')
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan')
const indexRouter = require('./routes/indexRouter');
const fileupload=require('express-fileupload')
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: true,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SECRET,
    cookie: {
        secure: false, // Ensure secure is false for development
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

app.all("*", (req, res, next) => {
    res.status(404).send('404 - Not Found');
});


// Server listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
