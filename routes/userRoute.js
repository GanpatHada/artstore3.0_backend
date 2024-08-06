const express=require('express');
const { createUser, userLogin } = require('../controllers/userController');
const userRouter=express.Router();

userRouter.post('/signup',createUser);
userRouter.post('/login',userLogin)
module.exports=userRouter;