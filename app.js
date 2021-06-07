// require express module
const express = require("express");

// extract function app
const app = express();

// Here require routers created at router folder

// requrie adminRouter from file
const adminRouter = require('./routers/adminRouter');

const ordersRouter = require('./routers/ordersRouter');

const userRouter = require('./routers/userRouter');

const cartRouter = require('./routers/cartRouter');

const productRouter = require('./routers/productRouter');

const authenticationRouter = require('./middlewheres/authentication');

const PromotionRouter=require('./routers/promotionRouter');


// make data streams with JSON type 
app.use(express.json());

// middlewhere to allow other server or ports to request on nodeJS server
app.use((req, res, next) => {

    // allow any port to request on nodejs server
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin , X-Requested-With , Content-Type , Accept , authorization '
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, PUT, OPTIONS'
    );

    next();

});



// Here define base route for all routers

// for admin base route

app.use('/*', authenticationRouter);

app.use('/api/user', userRouter);

app.use('/api/admin', adminRouter);

app.use('/api/promotion',PromotionRouter);

// for oders base router
app.use('/api/order', ordersRouter);

app.use('/api/cart', cartRouter);

app.use('/api/product', productRouter);


// exports app to be used in server.js file
module.exports = app;