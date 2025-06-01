const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId:{
    required:true,
    type:String
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
 deliveryCharge:{
    type:Number,
    default:0
  },
  products: [{
    productId:{
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  quantity:{
    type:Number,
    required:true
  },
  price:{
    type:Number,
    required:true
  }
  }],
  shippingAddress:{
    type: mongoose.Types.ObjectId,
    ref: "Address",
    required:true,
    
  },
  totalAmount:{
    type:Number,
    required:true
  },
  signature:String
},{
  timestamps:true
});
 
const Order=mongoose.model("Order",OrderSchema);
module.exports=Order;