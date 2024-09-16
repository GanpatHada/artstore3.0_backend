const Payment = require("../models/payment");

async function addPayment(paymentId, orderId, amount, signature) {
  try {
    const payment = new Payment({
      paymentId,
      orderId,
      amount,
      signature,
    });
    await payment.save();
    return {status:201,message:"payment saved",success:true}
  } catch (error) {
    throw error;
  }
}

module.exports = { addPayment };
