const express = require("express");
const { addAddress, getUser, addToCart, addToWishlist, deleteFromCart, deleteFromWishlist } = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const userRouter = express.Router();
userRouter.use(authenticateToken);
userRouter.post("/address", async (req, res) => {
  try {
    const { userId } = req;
    const {address,markDefault} = req.body;
    if (!address || !markDefault)
      return res.status(400).json({ message: "address is required" });
    const result=await addAddress(userId,address,markDefault);
    res.status(result.status).json({message:result.message})
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
});

userRouter.get("/",async(req,res)=>{
  try {
    const {userId} = req;
    const result=await getUser(userId);
    res.status(result.status).json({message:result.message,data:result.data,success:result.success});
  } catch (error) {
    res.status(500).json({success:false,message: "Internal server error",data:null});
    console.log(error);
  }
})

userRouter.patch("/cart",async(req,res)=>{
  const{productId}=req.body;
  if(!productId)
    return res.status(401).json({message:"Product id not given",success:false})
  try {
    const {userId}=req;
    const result=await addToCart(userId,productId);
    return res.status(result.status).json({message:result.message,success:result.success})
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
})


userRouter.patch("/wishlist",async(req,res)=>{
  const{productId}=req.body;
  if(!productId)
    return res.status(401).json({message:"Product id not given",success:false})
  try {
    const {userId}=req;
    const result=await addToWishlist(userId,productId);
    return res.status(result.status).json({message:result.message,success:result.success})
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
})

userRouter.delete("/cart",async(req,res)=>{
  const{productId}=req.body;
  if(!productId)
    return res.status(401).json({message:"product id not given",success:false})
  try {
    const {userId}=req;
    const result=await deleteFromCart(userId,productId);
    return res.status(result.status).json({message:result.message,success:result.success})
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
})


userRouter.delete("/wishlist",async(req,res)=>{
  const{productId}=req.body;
  if(!productId)
    return res.status(401).json({message:"product id not given",success:false})
  try {
    const {userId}=req;
    const result=await deleteFromWishlist(userId,productId);
    return res.status(result.status).json({message:result.message,success:result.success})
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
})



module.exports = userRouter;
