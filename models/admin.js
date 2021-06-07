// require module of mongoose
const mongoose = require("mongoose");

// define schema for admin 
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 30,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 120 // because of hash passwords but  in angular limit user enter max len 20
    },
    firstname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    lastname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    }

})

// // create model (collection ) in database
 const adminModel = mongoose.model('Admin', schema);

// // export adminModel to be used in other files
 module.exports = adminModel;
