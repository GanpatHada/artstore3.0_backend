const express = require("express");
const razorpay = require("../rzp.init");
const Payment = require("../models/payment");
const { addPayment } = require("../controllers/paymentController");
const { verifyRazorpaySignature } = require("../utils/Token");
const paymentRouter = express.Router();
require("dotenv").config();



paymentRouter.post("/create-order", async (req, res) => {
  const { amount, currency, receipt } = req.body;
  if (!amount)
    return res
      .status(400)
      .json({ message: "amount is required", success: false });
  const options = {
    amount: amount * 100,
    currency: currency || "INR",
    receipt: receipt || "order_rcptid_11",
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      message: "order created successfully",
      data: order,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", success: false });
  }
});

paymentRouter.post("/save-payment", async(req, res) => {
  const { paymentId, orderId, signature, amount } = req.body;
  if (!paymentId && !orderId && !signature && !amount)
    return res.status(400).json({message:"fields are empty",success:false})
  const signatureVerified=verifyRazorpaySignature(orderId,paymentId,signature)
  if(!signatureVerified)
    return res.status(400).json({message:"unauthorized access to order page",success:false});
  const result=await addPayment(req.body);
  if(result.success)
    return res.status(result.status).json({message:result.message,success:result.success})
    
});

module.exports = paymentRouter;
