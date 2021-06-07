// require module mongoose
const mongoose = require("mongoose");

// define schema for todo module in mongoDb 
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 20
    },
    gender: {
        required: true,
        type: String,
        enum: ['male', 'female']
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
    },
    age: {
        type: Number,
        min: 8,
        max: 120,
        required: true
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 30,
        unique: true
    },
    imageUrl: {
        type: String,
        default: 'https://res.cloudinary.com/dbhpbylzw/image/upload/v1616370230/user_plqutx.png'
    },
    cloudinary_id:{
        type: String,
        default:'user_plqutx'
    }
})


// make users model in database
const User = mongoose.model('User', schema);

// export model to be used in diff file
module.exports = User;