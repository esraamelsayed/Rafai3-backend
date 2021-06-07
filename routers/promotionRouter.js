// require express
const express = require('express');

// require adminModel in mongoDB
const mongoose = require('mongoose');
const PromotionModel = require('../models/promotion');

// require mongodb product model to get data about products
const productModel=require('../models/product');

// Base route    localhost:3000/api/promotion
const promotionRouter = new express.Router();


// make error handler function to display error messages

function errorHandler(err, req, res) {

    if (err.message.includes('duplicate') && err.message.includes('username')) { err.message = "username already exists" }
    if (err.message.includes('duplicate') && err.message.includes('email')) { err.message = "email already exists" }

    // return message error as json object
    res.json({ error: err.message })

}



// post promotion
promotionRouter.post('/:id',async(req,res,next)=>{

  
    try{
    // make sure if admin authenticated by req.adminId
    if(req.adminId==null) throw Error('failed to add promotion');

    // take details from id of param and req body
    const productId=req.params.id;


    // check if promotion for that product already exists .. make message to modify or delete and add new promotion
    const checkPromtionExist=await PromotionModel.find({productId:productId}).exec();

    if(checkPromtionExist.length>0) throw Error("promotion for that product already exists. Modify it or delete it and add new one");
   
    const {promotion,newprice}=req.body;

    if(promotion==null) throw Error('promotion details is required')

    // post a promotion to model
    const promotionCreated = await PromotionModel.create({productId:productId,promotion:promotion,newprice:newprice})

    res.statusCode=200;
    res.json(promotionCreated);

    }catch(err){
        res.statusCode = 500;

        errorHandler(err, req, res)

    }
})





// update promotion promotion
promotionRouter.patch('/:id',async(req,res,next)=>{

  
    try{
    // make sure if admin authenticated by req.adminId
    if(req.adminId==null) throw Error('failed to add promotion');

    // take details from id of param and req body
    const productId=req.params.id;


    // check if promotion for that product already exists .. make message to modify or delete and add new promotion
    const checkPromtionExist=await PromotionModel.find({productId:productId}).exec();

    if(checkPromtionExist.length==0) throw Error("no promotion exists for that product");
    
    const {promotion,newprice}=req.body;

    if(promotion==null) throw Error('promotion details is required')

    // post a promotion to model
    const promotionModified = await PromotionModel.updateOne({productId:productId},{promotion:promotion,newprice:newprice}).exec();

    res.statusCode=200;
    res.json(promotionModified);

    }catch(err){
        res.statusCode = 500;

        errorHandler(err, req, res)

    }
})



// delete promotion
promotionRouter.delete('/:id',async(req,res)=>{

    try{
        // make sure if admin authenticated by req.adminId
        if(req.adminId==null) throw Error('failed to add promotion. admin only can add promotions');
    
        // take details from id of param and req body
        const promotionId= req.params.id;
        const checkPromotionExist = await PromotionModel.findOne({ _id: promotionId}).exec();

        
        if(checkPromotionExist==null) throw Error('no promotion with that id')
    
        // post a promotion to model
       const promotionDeleted = await PromotionModel.deleteOne({ _id:promotionId}).exec();
    
        res.statusCode=200;
        res.json({success:"promotion is deleted"});
    
        }catch(err){
            res.statusCode = 500;
    
            errorHandler(err, req, res)
    
        }
})


// get all promotions
promotionRouter.get('',async(req,res,next)=>{

 
    try{

        // get all promotions from database
        const allPromotions=await PromotionModel.find().exec();   
  
       res.statusCode=200;
       res.json(allPromotions)

    }catch(err){
        res.statusCode = 500;
res.json({ee:err.message})
        errorHandler(err, req, res)

    }
})



promotionRouter.get('/:id',async(req,res,next)=>{

 
    try{
        //get promotion by its id
        const promotionId=req.params.id

        // get all promotions from database
        const PromotionDetails=await PromotionModel.find({productId:promotionId}).exec();   
  
       res.statusCode=200;
       res.json(PromotionDetails)

    }catch(err){
        res.statusCode = 500;
res.json({ee:err.message})
        errorHandler(err, req, res)

    }
})



module.exports=promotionRouter;