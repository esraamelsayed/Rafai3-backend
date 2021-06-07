//requre express module
const express = require("express");
const orderModel = require("../models/orders");

// require cart model to checkout
const cartModel=require('../models/cart');

// get router form module express
const ordersRouter = new express.Router();

// get ordersModel from file ordersModel to handle operations with database mongoDB
const ordersModel = require('../models/orders');



// make error handler function to display error messages
function errorHandler(err, req, res) {

    // return message error as json object
    res.json({ error: err.message })

}



// Base localhost:3000/api/orders

// To post new order 
ordersRouter.post('', async(req, res, next) => {

    try {

        // check if user that make order or not
        if(req.userId==null) throw Error('user can only make order');

        const cartDetails=await cartModel.findOne({userID:req.userID}).exec();

        // get userID  , totalquantity ,totalprice , products ((array of productId, quantity)) ,status :: by default pending
       
        // loop for every product in items in cart and get all products with their quantity
        let cartProducts=[];

        cartDetails['items'].forEach(item => {

            let appendedProd={productId:item['productId'],quantity:item['qty']};

            cartProducts.push(appendedProd);

        });
       
        let orderDetails=
        {
            userID:req.userId,
            totalquantity:cartDetails['totalQty'],
            totalprice:cartDetails['totalCost'],
            products:cartProducts,
        }

        // add data to database in orders collection
        const orderCreated = await ordersModel.create(orderDetails);

        res.statusCode = 200;
        res.json(orderCreated);

    } catch (err) {

        // return server internal error status
        res.statusCode = 500;
        // use error handler
        errorHandler(err, req, res)
    }
})


// get order details by id of this order
ordersRouter.get('/:id', async(req, res, next) => {

    try {

        // get id of order from param   
        const orderId = req.params.id;

        let checkOrderOwner = await ordersModel.findOne({ _id: orderId,userID:req.userId }).exec();

        if(checkOrderOwner=={}){

            if(req.adminId==null){

                throw Error("only order owner or admin can view product details");
            }
        }


        // check if there is query param by userId to get all orders related to that user
        const userID = req.query.userID;

        // make var called response and check if in that user use id so check for order details
        let response;

        if (orderId) { response = await ordersModel.findOne({ _id: orderId }).exec(); }

        // check if route contain query param to get all orders created by that user
        if (userID) { response = await ordersModel.findOne({ userID: userID }).exec(); }


        res.statusCode = 200;
        res.json(response);

    } catch (err) {

        //return internal server error
        res.statusCode = 500;
        // call error handler
        errorHandler(err, req, res);
    }

})



// get order details by id of this order
ordersRouter.get('/', async(req, res, next) => {

  
    try {
    

        if(req.adminId==null&&req.userId==null){
            throw Error("only admin get all orders. or user view his orders");
        }

        
        let ordersResponse;

        // check if admin logged in .. want to display all orders
        if(req.adminId!=null){

        

                      // here to make logic if user made query request by if condition
        if (Object.keys(req.query).length != 0) {

            // // here make logic of getting orders by date
            if (req.query.startDate) {

                // if there is end date.. so search for orders between start date and end date
                if (req.query.endDate) {

                    ordersResponse = await orderModel.
                    find({ createdAt: { $gt: req.query.startDate, $lt: req.query.endDate } }).
                    sort({ createdAt: 1 }).exec();
                } else {
                    // get all orders from start date provided
                    ordersResponse = await orderModel.find({ createdAt: { $gt: req.query.startDate } }).exec();
                
                
                }
            }

        } else {
            // if want to ignore values type that here {userId}
            // get all orders by userID FROM authentication
            ordersResponse = await orderModel.find().sort({ createdAt: -1 }).exec();
               
        }

        }

        
        // check if user logged in and want to display all of his orders

        if(req.userId!=null){

        // here to make logic if user made query request by if condition
        if (Object.keys(req.query).length != 0) {

            // // here make logic of getting orders by date
            if (req.query.startDate) {

                // if there is end date.. so search for orders between start date and end date
                if (req.query.endDate) {

                    ordersResponse = await orderModel.
                    find({ userID: req.userId, createdAt: { $gt: req.query.startDate, $lt: req.query.endDate } }).
                    sort({ createdAt: 1 }).exec();
                } else {
                    // get all orders from start date provided
                    ordersResponse = await orderModel.find({ userID: req.userId, createdAt: { $gt: req.query.startDate } }).exec();
                }
            }

        } else {
            // if want to ignore values type that here {userId}
            // get all orders by userID FROM authentication
            ordersResponse = await orderModel.find({ userID: req.userId }, { userID: 0 }).sort({ createdAt: -1 }).exec();
        }

    }
        res.statusCode = 200

        // here I will return orders
        res.json(ordersResponse)

    } catch (err) {
        // return server internal error 
        res.statusCode = 500;
        // call error handler by error from response
        errorHandler(err, req, res);
    }

})



// accept orders by patch and check if admin accept order
ordersRouter.patch('/:id/status', async(req, res, next) => {


    try {

        // check if admin modify that order status
        if(req.adminId==undefined) throw Error("only admins can accept or reject order");

        // get id of order from param   
        const orderId = req.params.id;

        const ordersDetails = await ordersModel.findOne({ _id: orderId }).exec();

        if(ordersDetails=={}) throw Error("invalid id for order");

        // get status from req body ... and check if accept or reject
        const { status,statusmessage } = req.body;

        if(status!='accepted'){if(status!='rejected'){throw Error('status modifiction should be accepted or rejected')}}

        const updatedOrder = await ordersModel.updateOne({ _id: orderId }, { status: status,statusmessage:statusmessage }).exec();

        res.statusCode = 200;
        res.json(updatedOrder);

    } catch (err) {

        // return server internal error 
        res.statusCode = 500;
        // call error handler by error from response
        errorHandler(err, req, res);
    }
})


ordersRouter.delete('/:id', async(req, res) => {

 
    try {

        // get orderId from param
        const orderId = req.params.id;

        // get orderdatails and check if user has this order to delete
        const orderDetails = await ordersModel.findOne({ _id: orderId }).exec();

        if (req.userId != orderDetails.userID) throw Error('not allowed to modify order. oly order owner can delete it');

        // delete order by its id
        ///  If order is pending => delete it ==== if not .. throw error that you can not delete order
        //                                                 because it is already accepted / rejected
        if (orderDetails['status'] == 'pending') {

            const deletedOrder = await ordersModel.deleteOne({ _id: orderId }).exec();
        } else {
            throw Error('order has already been ' + orderDetails['status']);
        }

        res.statusCode = 200;
        res.json(deletedOrder);

    } catch (err) {

        // return server internal error 
        res.statusCode = 500;
        // call error handler by error from response
        errorHandler(err, req, res);
    }

})




// ///   this logic for admin but it can be changed .. to allow admin see all orders

// // get order details by id of this order
// ordersRouter.get('/', async (req, res, next) => {

//     // that we will take from authentication
//     req.userID = '1202215152dsadsa1220';
//     try {

//         // get all orders if the user is admin
//         const userOrders = await orderModel.find().exec();

//         res.statusCode = 200

//         // here I will return orders
//         res.json(userOrders)

//     } catch (err) {
//         // return server internal error 
//         res.statusCode = 500;
//         // call error handler by error from response
//         errorHandler(err, req, res);
//     }

// })



//////check out///////////////////////////
// // GET: checkout form with csrf token
// router.get("/checkout", middleware.isLoggedIn, async (req, res) => {
//     const errorMsg = req.flash("error")[0];

//     if (!req.session.cart) {
//       return res.redirect("/shopping-cart");
//     }
//     //load the cart with the session's cart's id from the db
//     cart = await Cart.findById(req.session.cart._id);

//     const errMsg = req.flash("error")[0];
//     res.render("shop/checkout", {
//       total: cart.totalCost,
//       csrfToken: req.csrfToken(),
//       errorMsg,
//       pageName: "Checkout",
//     });
//   });

//   // POST: handle checkout logic and payment using Stripe
//   router.post("/checkout", middleware.isLoggedIn, async (req, res) => {
//     if (!req.session.cart) {
//       return res.redirect("/shopping-cart");
//     }
//     const cart = await Cart.findById(req.session.cart._id);
//     stripe.charges.create(
//       {
//         amount: cart.totalCost * 100,
//         currency: "usd",
//         source: req.body.stripeToken,
//         description: "Test charge",
//       },
//       function (err, charge) {
//         if (err) {
//           req.flash("error", err.message);
//           console.log(err);
//           return res.redirect("/checkout");
//         }
//         const order = new Order({
//           user: req.user,
//           cart: {
//             totalQty: cart.totalQty,
//             totalCost: cart.totalCost,
//             items: cart.items,
//           },
//           address: req.body.address,
//           paymentId: charge.id,
//         });
//         order.save(async (err, newOrder) => {
//           if (err) {
//             console.log(err);
//             return res.redirect("/checkout");
//           }
//           await cart.save();
//           await Cart.findByIdAndDelete(cart._id);
//           req.flash("success", "Successfully purchased");
//           req.session.cart = null;
//           res.redirect("/user/profile");.
//         });
//       }
//     );
//   });


module.exports = ordersRouter;