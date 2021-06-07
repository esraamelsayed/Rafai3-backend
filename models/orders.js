// require module mongoose
const mongoose = require("mongoose");

// define orders schema
const schema = new mongoose.Schema({
    userID: {
        required: true,
        type: String
    },
    createdAt: {
        required: true,
        type: Date,
        default: Date.now
    },
    totalquantity:{
        required:true,
        type:Number
    },
    totalprice: {
        required: true,
        type: Number
    },
    products: [{
        productId: {
            required: true,
            type: String
        },
        quantity: {
            required: true,
            type: Number
        }
    }],
    status: {
        required: true,
        enum: ['pending', 'accepted', 'rejected'],
        type: String,
        default: 'pending'
    },
    statusmessage:{
        default:'waiting for admin accept',
        type:String,
        
    }
})

const orderModel = mongoose.model('Order', schema);

module.exports = orderModel;