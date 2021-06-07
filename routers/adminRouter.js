// require express
const express = require('express');

const bcrypt=require('bcrypt')

// require adminModel in mongoDB
const adminModel = require('../models/admin');

// module to generate token if user logged in successfully
var jwt = require('jsonwebtoken');

// Base route    localhost:3000/api/admin
const adminRouter = new express.Router();



// make error handler function to display error messages

function errorHandler(err, req, res) {

    if (err.message.includes('duplicate') && err.message.includes('username')) { err.message = "username already exists" }
    if (err.message.includes('duplicate') && err.message.includes('email')) { err.message = "email already exists" }

    // return message error as json object
    res.json({ error: err.message })

}



// Define routes of requests for adminRouter

// login admin with his data originally made in database
adminRouter.post('/login',async(req,res)=>{

    try{

    // get data from request body
    const { username, password } = req.body

    // validate if user exists
    const admin = await adminModel.findOne({ username }).exec();
    if (admin == null) throw Error("wrongn user or password");// if admin doesn't exist
    
    // if admin exists .. Try to compare between hashed password in database and password inputted
        //logic oof hashing
    //let isMatched = await bcrypt.compare(password, admin.password)
    
    let isMatched=(admin.password==password);
    
     if (!isMatched) throw Error('wrongn username or password'); // if password not matched
      // if matched .. generate token for that user to be used in website
      var token = await jwt.sign({ id: admin._id }, 'verySecret');

      res.statusCode = 200
      res.json({ token })

    }catch(err){
        res.statusCode = 401;

        errorHandler(err, req, res)

    }

})





// get admin details
adminRouter.get('',async(req,res)=>{

    try{

        // get admin details by id got from authorization
        const adminId=req.adminId;

        if(req.adminId==null) throw Error('Authentication failed')

        // find admin data in data base
        const adminDetails=await adminModel.findOne({_id:adminId},{password:0}).exec();

        res.statusCode=200;

        res.json(adminDetails)


    }catch(err){

        res.statusCode=500;
        errorHandler(err,req,res)
    }

})





// export adminRouter to be used in app file
module.exports = adminRouter;