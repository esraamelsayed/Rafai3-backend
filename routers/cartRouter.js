const express = require("express");
const Product = require("../models/product");
const Cart = require("../models/cart");

const router = express.Router();


// GET: add a product to the shopping cart when "Add to cart" button is pressed
router.post("/:id", async(req, res, next) => {


    const productId = req.params.id;

    try {
        // get the correct cart, either from the db, session, or an empty cart.
        let user_cart;
        // if (req.userIdId) {
        //     user_cart = await Cart.findOne({ user: req.userIdId });
        // }
        // let cart;
        // if (
        //     (req.userId && !user_cart && req.session.cart) ||
        //     (!req.userId && req.session.cart)
        // ) {
        //     cart = await new Cart(req.session.cart);
        // } else if (!req.userId || !user_cart) {
        //     cart = new Cart({});
        // } else {
        //     cart = user_cart;
        // }


        let cart = await Cart.findOne({ user: req.userId })

        // add the product to the cart
        const product = await Product.findById(productId);

        const itemIndex = cart.items.findIndex((p) => p.productId == productId);

        if (itemIndex > -1) {
            // if product exists in the cart, update the quantity
            cart.items[itemIndex].qty++;
            cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
            cart.totalQty++;
            cart.totalCost += product.price;

        } else {
            // if product does not exists in cart, find it in the db to retrieve its price and add new item
            cart.items.push({
                productId: productId,
                qty: 1,
                price: product.price,
                title: product.title
            });
            cart.totalQty++;
            cart.totalCost += product.price;
        }


        // if the user is logged in, store the user's id and save cart to the db
        if (req.userId) {
            cart.user = req.userId;
            await cart.save();
        }
        //   req.session.cart = cart;
        // res.json({ message: "item added to cart" })
        res.json(cart)


    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});


// GET: view shopping cart contents
router.get("/", async(req, res) => {

    try {
        // find the cart, whether in session or in db based on the user state
        let cart_user;
        if (req.userId) {
            cart_user = await Cart.findOne({ user: req.userId });
            res.json(cart_user)
        }
        // // if user is signed in and has cart, load user's cart from the db
        // if (req.userId && cart_user) {
        //     req.session.cart = cart_user;
        //     return res.render("shop/shopping-cart", {
        //         cart: cart_user,
        //         pageName: "Shopping Cart",
        //         products: await productsFromCart(cart_user),
        //     });
        // }
        // // if there is no cart in session and user is not logged in, cart is empty
        // if (!req.session.cart) {
        //     return res.render("shop/shopping-cart", {
        //         cart: null,
        //         pageName: "Shopping Cart",
        //         products: null,
        //     });
        // }
        // otherwise, load the session's cart
        //  return res.render("shop/shopping-cart", {
        //      cart: req.session.cart,
        //       pageName: "Shopping Cart",
        //       products: await productsFromCart(req.session.cart),
        //  });
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});

// GET: reduce one from an item in the shopping cart
router.delete("/:id", async function(req, res, next) {
    // if a user is logged in, reduce from the user's cart and save
    // else reduce from the session's cart
    const productId = req.params.id;

    let cart;
    try {
        if (req.userId) {
            cart = await Cart.findOne({ user: req.userId });

        }
        // find the item with productId
        let itemIndex = cart.items.findIndex((p) => p.productId == productId);

        if (itemIndex > -1) {
            // find the product to find its price

            const product = await Product.findById(productId);
            // if product is found, reduce its qty

            cart.items[itemIndex].qty--;
            cart.items[itemIndex].price -= product.price;
            cart.totalQty--;
            cart.totalCost -= product.price;
            // if the item's qty reaches 0, remove it from the cart
            if (cart.items[itemIndex].qty <= 0) {
                await cart.items.remove({ _id: cart.items[itemIndex] });
            }


            await cart.save();

            // req.session.cart = cart;
            // //save the cart it only if user is logged in
            // if (req.userId) {
            //     await cart.save();
            // }
            //delete cart if qty is 0
            // if (cart.totalQty <= 0) {
            //     req.session.cart = null;
            //     await Cart.findByIdAndRemove(cart);
            // }
            res.json(cart)

        }

        res.redirect(req.headers.referer);
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});

// GET: remove all instances of a single product from the cart
router.delete("/removeAll/:id", async function(req, res, next) {
    const productId = req.params.id;
    let cart;
    try {
        if (req.userId) {
            cart = await Cart.findOne({ user: req.userId });

        } else if (req.session.cart) {
            cart = await new Cart(req.session.cart);
        }
        //fnd the item with productId
        let itemIndex = cart.items.findIndex((p) => p.productId == productId);

        if (itemIndex > -1) {
            //find the product to find its price
            cart.totalQty -= cart.items[itemIndex].qty;
            cart.totalCost -= cart.items[itemIndex].price;
            await cart.items.remove({ _id: cart.items[itemIndex] });
            res.json(cart);
        }
        // req.session.cart = cart;
        //save the cart it only if user is logged in
        if (req.userId) {
            await cart.save();
        }
        //delete cart if qty is 0
        // if (cart.totalQty <= 0) {
        //     req.session.cart = null;
        //     await Cart.findByIdAndRemove(cart);
        // }
        res.json({ cartInfo: cart })
        res.redirect(req.headers.referer);
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});

// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
    let products = []; // array of objects
    for (const item of cart.items) {
        let foundProduct = (
            await Product.findById(item.productId).populate("category")
        ).toObject();
        foundProduct["qty"] = item.qty;
        foundProduct["totalPrice"] = item.price;
        products.push(foundProduct);
    }
    return products;
}

module.exports = router;