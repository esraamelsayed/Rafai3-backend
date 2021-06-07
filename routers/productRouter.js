const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const ProductRouter = new express.Router();

const cloudinary = require('../utilities/cloudinary'); //importing cloudinary middlewhere to help in image upload
const upload = require('../utilities/multer'); //importing multer middlewhere to jelp with files

//post a new product *image file should be passed yuing key "image" to match the middlewhere
ProductRouter.post('/', upload, async (req, res) => {
  try {
    const result =  await cloudinary.uploader.upload(req.file.path);
    
    const { title, details, category, price} = req.body;
    const product = await Product.create({ title, details, category, price, imageUrl: result.secure_url, cloudinary_id: result.public_id });
    console.log(product);
    res.statusCode = 200;
      res.send(product);
    } catch (err) {
      res.statusCode = 422;
      res.send({ success: false, err: err });
    }
  });

//get all products
  ProductRouter.get('/', async (req, res) => {
    try {
      const products = await Product.find().exec();
      console.log(products)
      res.statusCode = 200;
      res.send(products);
  
    } catch (error) {
      res.statusCode = 422;
      res.send({ message: 'not found' });
  
    }
  });
  
//get a specific product using its id
  ProductRouter.get('/:id', async(req, res) =>{
    try {
      const id = req.params.id;
      const product = await Product.findOne({_id:id});
      res.statusCode = 200;
      res.send({product : product});
    } catch (err) {
      res.statusCode = 401;
      res.send({message: 'not found'});
    }
  });

//delete a specifc product using its id
  ProductRouter.delete('/:id', async(req, res, next) =>{
    try {
      const id = req.params.id;
      let product = await Product.findById(req.params.id);
      const result = await cloudinary.uploader.destroy(product.cloudinary_id);
      console.log(result);
      await Product.deleteOne({_id:id});
      res.statusCode = 200;
      res.send({message : 'Product deleted'});
    } catch (err) {
      res.statusCode = 422;
      res.send({message: 'deletion falied'});
    }
  });

//filter products through categories 
  ProductRouter.get('/filter/:category', async(req, res) =>{
    try {
      const filteredProducts = await Product.find({category : req.params.category});
      console.log(filteredProducts);
      res.statusCode = 200;
      res.send(filteredProducts);
    } catch (err) {
      res.statusCode = 422;
      res.send({message: 'no products found'});
    }
  });

//update a product feature 
ProductRouter.patch('/:id', upload ,async(req, res, next) => {
  try {
    if(req.adminId==undefined) throw Error("only admins can accept or reject order");
    const _id = req.params.id;
    let product = await Product.findById(_id);
    let result;
    if(!(req.file == null)){
      const x = await cloudinary.uploader.destroy(product.cloudinary_id);
      console.log(x);
      result = await cloudinary.uploader.upload(req.file.path);
      product.imageUrl = result.secure_url;
      product.cloudinary_id = result.public_id;
    }
    const data = {
      title: req.body.title || product.title,
      imageUrl: product.imageUrl,
      details: req.body.details || product.details,
      price: req.body.price || product.price,
      cloudinary_id: product.cloudinary_id,
    };
    await Product.updateOne({_id}, data);
    const editedProduct = await Product.findById(_id);
    console.log(editedProduct);
    res.statusCode = 200;
    res.send({editedProduct: editedProduct});
  } catch (err) {
    res.statusCode = 422;
    res.send({message: 'edit failed'});
  }
});

  module.exports = ProductRouter;