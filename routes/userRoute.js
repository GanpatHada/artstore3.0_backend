const express=require('express');
const { createUser, userLogin } = require('../controllers/userController');
const userRouter=express.Router();

userRouter.post('/signup',async(req,res)=>{
    try {
        const{userName,email,password}=req.body;
        if(!userName || !email || !password)
           return res.status(400).json({message:'username,email and password are required'})
        const result=await createUser({userName,email,password});
        res.status(result.status).json({message:result.message,token:result.token||undefined})
    } catch (error) {
        res.status(500).json({message:'Internal server error'}); 
        console.log(error);
    }
});
userRouter.post('/login',async (req,res)=>{
    try {
        const{email,password}=req.body;
        if(!email || !password)
           return res.status(400).json({message:'email and password are required'})
        const result=await userLogin({email,password});
        res.status(result.status).json({message:result.message,token:result.token||undefined})       
    } catch (error) {
        res.status(500).json({message:'Internal server error'});
        console.log(error);
    }
})
module.exports=userRouter;