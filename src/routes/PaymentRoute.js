const express = require("express");
const razorpay = require("../config/rzp.config");
const { addPayment, getPaymentDetails } = require("../controllers/paymentController");
const { verifyRazorpaySignature } = require("../utils/Token");
const { nanoid } = require("nanoid");
const authenticateToken = require("../middlewares/auth");
const paymentRouter = express.Router();
require("dotenv").config();

paymentRouter.post("/create-order", async (req, res) => {
  const { amount, currency } = req.body;
  if (!amount)
    return res
      .status(400)
      .json({ message: "amount is required", success: false });
  const options = {
    amount: amount * 100,
    currency: currency || "INR",
    receipt: nanoid() || "order_rcptid_11",
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      message: "order created successfully",
      data: {
        ...order,
        amount: order.amount / 100,
        amount_due: order.amount_due / 100,
      },
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", success: false });
  }
});

paymentRouter.post("/save-payment", authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { paymentId, payment_orderId, signature, amount, products, address } =
    req.body;
  if (
    !paymentId ||
    !payment_orderId ||
    !signature ||
    !amount ||
    !products ||
    !userId ||
    !address
  )
    return res
      .status(400)
      .json({ message: "fields are empty", success: false });
  const orderId = payment_orderId;
  const signatureVerified = verifyRazorpaySignature(
    orderId,
    paymentId,
    signature
  );
  if (!signatureVerified)
    return res
      .status(400)
      .json({ message: "unauthorized access to order page", success: false });
  const result = await addPayment({ ...req.body, userId });
  console.log(result);
  if (result.success)
    res
      .status(result.status)
      .json({
        message: result.message,
        success: result.success,
        data: result.data,
      });
});

paymentRouter.get("/payment-details/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  if(!paymentId)
    return res.status(400).json({message:'paymentId not found',success:false})
  try {
    const result=await getPaymentDetails(paymentId);
    return res.status(result.status).json({message:result.message,success:result.success,data:result.data})
  } catch (error) {
    return res.status(500).json({message:"Internal server error",success:false})
  }
});

module.exports = paymentRouter;
