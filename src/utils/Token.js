const jwt = require("jsonwebtoken");
const crypto=require('crypto')
require("dotenv").config();
const MY_SECRET = process.env.SECRET_KEY;
function createToken(userId) {
  const token = jwt.sign({ userId }, MY_SECRET);
  return token;
}

function verifyToken(token) {
  try {
    const decodedTokenData = jwt.verify(token, MY_SECRET);
    return {message:"user authenticated",data:decodedTokenData.userId,success:true}
  } catch (error) {
    return {message:"unauthorized access",success:false}
  }
}

function verifyRazorpaySignature(orderId,paymentId,signature){
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");
  console.log(generatedSignature)  
  return (generatedSignature===signature)
}
module.exports = {createToken,verifyToken,verifyRazorpaySignature};
