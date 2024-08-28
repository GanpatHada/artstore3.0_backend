const express=require('express');
const { addProduct } = require('../controllers/productController');
const productRouter=express.Router();

productRouter.post("/",async(req,res)=>{
    try {
        const result=await addProduct(req.body);
        res.status(result.status).json({message:result.message});
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
})

module.exports=productRouter