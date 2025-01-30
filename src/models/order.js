const mongoose = require("mongoose");
const { addressSchema } = require("./address");

const OrderSchema = new mongoose.Schema({
  orderId:{
    required:true,
    type:'String'
  },
  paymentId:{
    required:true,
    type:String,
  },
  customerId:{
    required:true,
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  products: [{
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "Product",
  }],
  amount:{
    required:true,
    type:Number
  },
  address:addressSchema,
  signature:String
},{
  timestamps:true
});
 
const Order=mongoose.model("Order",OrderSchema);
module.exports=Order;