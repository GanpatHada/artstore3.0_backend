const express = require("express");
const Razorpay=require('razorpay')
const { createUser, userLogin } = require("../controllers/userController");
const homeRouter = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

homeRouter.post('/create-order', async (req, res) => {
  const { amount, currency, receipt } = req.body;
  if (!amount)
    return res
      .status(400)
      .json({ message: "amount is required" });
  const options = {
    amount: amount * 100,
    currency: currency || "INR",
    receipt: receipt || "order_rcptid_11",
    payment_capture: 1
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).send("Error creating order");
  }
});

homeRouter.post("/signup", async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password)
      return res
        .status(400)
        .json({ message: "username,email and password are required" });
    const result = await createUser({ userName, email, password });
    res
      .status(result.status)
      .json({ message: result.message, token: result.token || undefined });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
});


homeRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and password are required" });
    const result = await userLogin({ email, password });
    res
      .status(result.status)
      .json({ message: result.message, token: result.token || undefined });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
});



homeRouter.get("/", (req, res) => {
  res.send("Hello world");
});


module.exports = homeRouter;
