const { v4 : uuid } = require("uuid");
const Order = require("../models/order");
const razorpay = require("../config/rzp.config");
async function addPayment({paymentId,payment_orderId, signature, amount,products,address,userId}){
  const orderId=uuid()
  try {
    const order = new Order({
      orderId,
      paymentId,
      payment_orderId,
      amount,
      signature,
      products,
      userId,
      address
    });
    let savedOrder=await order.save();
    savedOrder=await savedOrder.populate("products")
    return {status:201,message:"payment saved",success:true,data:savedOrder}
  } catch (error) {
    throw error;
  }
}

async function getPaymentDetails(paymentId){
  try {
    const payments=await razorpay.payments.fetch(paymentId);
    return {status:200,data:payments,success:true}
  } catch (error) {
    throw error;
  }
  
}
module.exports = { addPayment,getPaymentDetails };
