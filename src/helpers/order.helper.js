const crypto = require("crypto");

function getProvidedSignature(razorpay_order_id,razorpay_payment_id){
    const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
    return generated_signature;
}

function verifySignature(orderId, paymentId, signature){
  const generatedSignature = getProvidedSignature(orderId, paymentId);
  return generatedSignature == signature;
};


module.exports={verifySignature}