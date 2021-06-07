// use express module to make router
const express = require('express')


const cloudinary = require('../utilities/cloudinary'); //importing cloudinary middlewhere to help in image upload
const upload = require('../utilities/multer'); //importing multer middlewhere to jelp with files

// module used to hash password
const bcrypt = require('bcryptjs');

// module to generate token if user logged in successfully
var jwt = require('jsonwebtoken');

// require mongodb users model to deal with database
const usersModel = require('../models/user');
const Cart = require("../models/cart");
const Order = require("../models/orders");
const Product = require("../models/product");


// make router for users apis
const userRouter = new express.Router();


// make error handler function to display error messages

function errorHandler(err, req, res) {

    if (err.message.includes('duplicate') && err.message.includes('username')) { err.message = "username already exists" }
    if (err.message.includes('duplicate') && err.message.includes('email')) { err.message = "email already exists" }

    // return message error as json object
    res.json({ error: err.message })

}


// base route '/api/user'


// define register api
userRouter.post('/register', async(req, res) => {

    try {

        // get username and password from request body

        // Note here we shou;d put image .. search for it later
        const { username, password, firstname, lastname, gender, age, phone, email } = req.body;


        // hash password inputted 
        const hash = await bcrypt.hash(password, 7);

        req.body['password'] = hash;



        //if there is cart session, save it to the user's cart in db
        // if (req.session.cart) {
        //     res.json({ dd: "sss" })
        //     const cart = await new Cart(req.session.cart);
        //     cart.user = req.user._id;
        //     await cart.save();
        // }

        // insert data into mongodb and make valudation by username when user inputted same user
        // by unique attribute in user model in schema
        // const userCreated = await usersModel.create({ username, password: hash, firstname, lastname, age, phone, email })
        const userCreated = await usersModel.create(req.body)

        await Cart.create({ user: userCreated._id })


        // console.log(userCreated)

        res.statusCode = 200
        res.json({ Success: "User created successfully" })

    } catch (err) {
        // return server internal error status
        res.statusCode = 500
            // res.json({ error: err.message })
        errorHandler(err, req, res)
    }
})


// login user -------------------------------------------
userRouter.post('/login', async(req, res) => {

    try {
        // get data from request body
        const { username, password } = req.body

        // cart logic when the user logs in
        // let cart = await Cart.findOne({ user: req.userId });
        // // if there is a cart session and user has no cart, save it to the user's cart in db
        // if (req.session.cart && !cart) {
        //     const cart = await new Cart(req.session.cart);
        //     cart.user = req.user._id;
        //     await cart.save();
        // }
        // if user has a cart in db, load it to session
        // if (cart) {
        //     req.session.cart = cart;
        // }

        // validate if user exists
        const user = await usersModel.findOne({ username }).exec();

        if (user == null) throw Error("wrongn user or password"); // if user doesn't exist

        // if user exists .. Try to compare between hashed password in database and password inputted
        const isMatched = await bcrypt.compare(password, user.password)


        if (!isMatched) throw Error('wrongn username or password'); // if password not matched
        // if matched .. generate token for that user to be used in website
        var token = await jwt.sign({ id: user._id }, 'verySecret');

        res.statusCode = 200
            // give user this token in his local storage to be identified every time he go through all
            // website application so he doesn't need to login every time
            // then set it to local storage in angular
        res.json({ token })

    } catch (err) {

        res.statusCode = 401;

        errorHandler(err, req, res)
    }

})




// create middle where to ensure authorization before next requests
userRouter.use((req, res, next) => {

    try {
        // get token from req headers in authorization value
        const { authorization } = req.headers

        if (authorization == '') {
            res.status(401).json({ error: "authentication failed" })
        }

        // verify token by secret 'verySecret' created with token when user logged in
        var user = jwt.verify(authorization, 'verySecret', function(err, userTokenSignature) {


            if (err == { Error: "jwt malformed" }) {
                // err.message = "user doesn't exist"

                throw Error("authentication failed")
            }


            if (!userTokenSignature) throw Error("authentication failed"); // if user not exists throw error

            // if user exists   / I will return id but without using it only in case user want to delete
            //                      or edit his profile  in angular components
            const userDetails = usersModel.findOne({ _id: userTokenSignature.id }, { password: 0, _id: 1, __v: 0 }).exec().then(

                (userDate) => {
                    // if success .. authorization success then next()
                    // can pass id of user in request
                    req.userId = userTokenSignature.id;
                    next();
                },
                (err) => {

                    throw err;
                }
            );
        });

    } catch (err) {

        errorHandler(err, req, res);
    }

})




// get user details by token returned to user from login
userRouter.get('/', async(req, res) => {


    try {

        // if user exists   / I will return id but without using it only in case user want to delete
        //                      or edit his profile  in angular components
        const userDetails = await usersModel.findOne({ _id: req.userId }, { password: 0 }).exec();

        // return user first name
        res.statusCode = 200
        res.json(userDetails)

    } catch (err) {

        res.statusCode = 401
        res.json({ Eroor: err.message })
    }
})




// this if user want to change his password but first confirm old password
userRouter.patch('/changePassword', async(req, res) => {
    try {


        // get password form body
        const { password } = req.body;

        const { newPassword } = req.body;



        // find if user exisits in adta base and check for his password
        var userDetails = await usersModel.findOne({ _id: req.userId }, { firstname: 0, lastname: 0, age: 0, phone: 0 }).exec();

        if (userDetails == {}) { errorHandler(Error("user doesn't exist"), req, res, next) }
        // get hashed password from userDetails
        const hashedPass = userDetails.password;

        const isMatched = await bcrypt.compare(password, hashedPass);


        if (isMatched) {

            // hash inserted password to be inserted in database
            const newPass = await bcrypt.hash(newPassword, 7);


            // update password in database
            const dataChanged = await usersModel.updateOne({ _id: req.userId }, { password: newPass }).exec();


            res.statusCode = 200;
            res.json({ Success: 'password modified successfully' })
        } else {
            // res.json({ Failed: 'wrong password' })
            throw Error('old password is invalid');
        }

    } catch (err) {

        errorHandler(err, req, res);
    }

})




//in case user want to delete his account from website
//Also I will make another one that if this user is admin but  will prepare it later

//   delete user by id from paramater only if he has same id in token in authorization
userRouter.delete('/', async(req, res) => {

    try {

        // get id inserted in paramater 
        // const { id } = req.params

        // get id from token but first get token from authorization 
        // const { authorization } = req.headers

        // // get id from token signature
        // var user = await jwt.verify(authorization, 'verySecret');

        // check if id in paramater is not same as id in token
        // if (!(id == user.id)) throw Error("you can't delete user with that id because it isn't your id");

        // if they are same, delete user with that id
        const res = await usersModel.remove({ _id: req.userId });


        res.statusCode = 200
        res.json({ Success: "you have deleted your user " })

    } catch (err) {

        res.statusCode = 500
        res.json({ Error: err.message })
    }
})




// if user want to edit his details

// edit user only if id inputted in paramater is same as that id in token in authorization
// which exists in requrest headers
userRouter.patch('/update', async(req, res) => {

    try {

        // get id from paamater
        // const { id } = req.params

        // check if id from token and paramaters are different
        // if (!(id == req.userId)) errorHandler(Error("you can't edit other user details"), req, res, next);
        // if (!(id == req.userId)) throw Error("you can't edit user you don't own");


        // if they are same
        // get details that this user want to modify
        const changeDataValues = req.body



        // hash password inputted 


        // modify user data
        const userModified = await usersModel.updateOne({ _id: req.userId }, changeDataValues).exec();

        res.statusCode = 200
        res.json({ Success: "user modified successfully" })

    } catch (err) {


        errorHandler(err, req, res);
    }
})

userRouter.patch('/updateImage', upload, async(req, res) => {
        try {
            let user = await usersModel.findById({ _id: req.userId });
            let result;
            const x = await cloudinary.uploader.destroy(user.cloudinary_id);
            console.log(x);
            result = await cloudinary.uploader.upload(req.file.path);
            user.imageUrl = result.secure_url;
            user.cloudinary_id = result.public_id;

            res.statusCode = 200;
            res.send(user.imageUrl);
        } catch (error) {
            console.log(error);
            res.statusCode = 422;
            res.send('not updated');
        }
    }

);

// export uterRouter to be used in other files
module.exports = userRouter;