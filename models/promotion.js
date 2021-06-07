const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        minlength: 10,
        maxlength: 50,
        unique:true
    },
    promotion: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    newprice:{
        type:Number,
        required:true
    }

}
);

const PromotionModel = mongoose.model('Promotion', schema);

module.exports = PromotionModel;