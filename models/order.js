const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId:{
    required:true,
    type:mongoose.Types.ObjectId,
    ref:"User"

  },
  productId: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  amount:Number,
  paymentId:String,
  orderId:String,
  signature:String
});
 
const Order=mongoose.model("Order",OrderSchema);
module.exports=Order;