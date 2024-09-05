const express=require('express');
const { addProduct, getProducts, getProductDetails } = require('../controllers/productController');
const productRouter=express.Router();

productRouter.post("/",async(req,res)=>{
    try {
        const result=await addProduct(req.body);
        return res.status(result.status).json({message:result.message});
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
})

productRouter.get("/",async(req,res)=>{
    try {
        const result=await getProducts();
        if(result.success)
            return res.status(result.status).json({message:result.message,data:result.data})
        else
           return res.status(result.status).json({message:result.message})

    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
})

productRouter.get("/:productId",async(req,res)=>{
    try {
        const {productId}=req.params;
        const result=await getProductDetails(productId);
        res.status(result.status).json({message:result.message,data:result.data})
    } catch (error) {
        res.status(500).json({message:"Internal server error"}); 
    }
})

module.exports=productRouter