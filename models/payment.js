const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  amount:Number,
  paymentId:String,
  OrderId:String,
  signature:String,
});
 
const Payment=mongoose.model("Payment",PaymentSchema);
module.exports=Payment;