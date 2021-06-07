// use express module to make router
const express = require('express')

// module to generate token if user logged in successfully
var jwt = require('jsonwebtoken');
const adminModel = require('../models/admin');

// define express router
const authneticationRouter = new express.Router;

// require mongodb users model to deal with database
const usersModel = require('../models/user');


// make error handler function to display error messages
function errorHandler(err, req, res) {

    if (err.message.includes('duplicate') && err.message.includes('username')) { err.message = "username already exists" }
    if (err.message.includes('duplicate') && err.message.includes('email')) { err.message = "email already exists" }

    // return message error as json object
    res.json({ error: err.message })

}

// async function authorize(req,res,next){

//     //   get token from req headers in authorization value
//     const { Authorization } = req.headers;

    
//     // if (authorization == '') {
//         //     res.status(401).json({ error: "authentication failed" })
//         // }
//         // verify token by secret process.env.hushh created with token when user logged in
        
        
//         var userTokenSignature =  jwt.verify(req.headers['authorization'], process.env.hushh,function(err,tokenSignature){
            
//            // if(err) throw Error('authentication failed');
           
//            async function getUserDetails(){
//             const userDetails =await usersModel.findOne({ _id: tokenSignature.id }, { password: 0, _id: 1, __v: 0 }).exec()

//             res.json(userDetails)
//            }
//            res.json(userDetails)


//         }) ;
        
//         if (!userTokenSignature) throw Error("authentication failed"); // if user not exists throw error
        

//     const userDetails =await usersModel.findOne({ _id: userTokenSignature.id }, { password: 0, _id: 1, __v: 0 }).exec()

//     const adminDetails=await adminModel.findOne({_id:userTokenSignature.id},{password:0, _id:1,__v:0}).exec();

//     if(userDetails=={} &&adminDetails=={}) throw Error("authentication failed");

//    //  if success .. authorization success then

  
//    //  can pass id of user in request
//    if(userDetails!=null){

//        req.userId = userTokenSignature.id;
//    }

//    if(adminDetails!=null){
   
//        req.adminId=userTokenSignature.id;
      
//     }

    
 
//      next();

// }






// create middle where to ensure authorization before next requests
authneticationRouter.use((req, res, next) => {
   
    try {


        const loginRouter = "/api/user/login"
        const registerRouter = "/api/user/register"
        const adminLoginrouter="/api/admin/login"
        
       
    
        if (req.originalUrl == loginRouter || req.originalUrl == registerRouter||req.originalUrl==adminLoginrouter) {
           return next();
            
        }
        
        // for promotions request .. will go next() because it doesnt require authentication
        // if method is get and to route api/promotion
        const getPromotionsRoute="/api/promotion"

        
      
        if(req.method=="GET"&&req.originalUrl.startsWith( getPromotionsRoute)){
            
           return next();
        }

        // if request for products .. allow every one
        const getProductsRoute="/api/product"
        if(req.method=="GET"&&req.originalUrl.startsWith('/api/product')){
            
            return next();
         }

    
//////////// here make authrizaton logic
        // get token from req headers in authorization value
        const { authorization } = req.headers

        if (authorization == '') {
            res.status(401).json({ error: "authentication failed" })
        }
        // verify token by secret process.env.hush created with token when user logged in
        var user = jwt.verify(authorization, process.env.hushh, function (err, userTokenSignature) {
            
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
                    
                    if(userDate!=null){
                        req.userId = userTokenSignature.id;
                        
                        
                      return  next();
                    }
                    
                    // make logic to find if admin is logged in 
                    const adminDetails=adminModel.findOne({_id:userTokenSignature.id},{password:0,_id:1,__v:0}).exec().then(
                        
                        (adminData)=>{
                            
                            // res.json({dd:"aaa"})
                           
                            //if sunccess  for admin authorization then next()
                            // can pass admin id in request
                           
                            if(adminData!=null){
                                req.adminId=userTokenSignature.id;
                                
                             return   next();
                            }
                            throw Error('authentication failed')
                        },
                        (err)=>{

                            throw Error('authentication failed')
                        }
                        
                    )

                //    next();
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


// authneticationRouter.use(function(req,res,next){

    
  
//     try{
//     const loginRouter = "/api/user/login"
//     const registerRouter = "/api/user/register"
//     const adminLoginrouter="/api/admin/login"


//     if (req.originalUrl == loginRouter || req.originalUrl == registerRouter||req.originalUrl==adminLoginrouter) {

//         next();
//     }

//     // for promotions request .. will go next() because it doesnt require authentication
//     // if method is get and to route api/promotion
//     const getPromotionsRoute="/api/promotion"
  
//     if(req.method=="GET"&&req.originalUrl==getPromotionsRoute){
        
//         next();
//     }

    
    
// authorize(req,res,next);




//     }catch(err){

//           // return server internal error status
//           res.statusCode = 401;
//         errorHandler(err, req, res);
//     }
   



// })


// // create middle where to ensure authorization before next requests
// authneticationRouter.use((req, res, next) => {

//     const loginRouter = "/api/login"
//     const registerRouter = "/api/register"

//     if (req.originalUrl == loginRouter || req.originalUrl == registerRouter) {

//         next();
//     }

  

//     try {
//         // get token from req headers in authorization value
//         const { authorization } = req.headers

//         if (authorization == '') {
//             res.status(401).json({ error: "authentication failed" })
//         }

//         // verify token by secret process.env.hushh created with token when user logged in
//         var user = jwt.verify(authorization, process.env.hushh, function(err, userTokenSignature) {


//             if (err == { Error: "jwt malformed" }) {
//                 // err.message = "user doesn't exist"

//                 throw Error("authentication failed")
//             }



//             if (!userTokenSignature) throw Error("authentication failed"); // if user not exists throw error

//             // if user exists   / I will return id but without using it only in case user want to delete
//             //                      or edit his profile  in angular components
//             const userDetails = usersModel.findOne({ _id: userTokenSignature.id }, { password: 0, _id: 1, __v: 0 }).exec().then(

//                 (userDate) => {
//                     // if success .. authorization success then next()
//                     // can pass id of user in request
//                     req.userId = userTokenSignature.id;

//                    // next();
//                 },
//                 (err) => {

//                     throw err;
//                 }
//             );
//         });

//     } catch (err) {

//         errorHandler(err, req, res);
//     }

// })


module.exports = authneticationRouter;