const { v4 : uuid } = require("uuid");
const Order = require("../models/order");
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
module.exports = { addPayment };
