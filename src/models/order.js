const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId:{
    required:true,
    type:'String'
  },
  paymentId:{
    required:true,
    type:String,
  },
  buyerId:{
    required:true,
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  products: [{
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "Product",
  }],
  shippingAddress:{
    required:true,
    type:String
  },
  signature:String
},{
  timestamps:true
});
 
const Order=mongoose.model("Order",OrderSchema);
module.exports=Order;