const mongoose = require('mongoose');

const schema = new mongoose.Schema({
        title: {
            type : String,
            required: true,
            minlength: 10,
            maxlength: 50
        },
        details:{
            type: String,
            required: true,
            minlength: 10,
            maxlength: 500
        },
        category:{
            type : String,
            enum : ["kitchen", "living", "bathroom", "bedroom", "others"],
            default: "others",
        },
        price:{
            type: Number,
            required: true
        },
        imageUrl: {
            type: String,
        },
        cloudinary_id:{
            type : String,
        }
        
},
{timestamps: true});

const Product = mongoose.model('Product', schema);

module.exports  =  Product;