const { customAlphabet } = require("nanoid");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asynchandler");
const razorpay = require("../config/rzp.config");
const ApiResponse = require("../utils/ApiResponse");
const { alphaNumber } = require("../Constents");

const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount) throw new ApiError(400, "Amount not given");

  const getUniqueReceiptNo=customAlphabet(alphaNumber,12)

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `RECNO${getUniqueReceiptNo()}`,
  };
  try {
    const order = await razorpay.orders.create(options);
    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    throw new ApiError(500, "Payment gateway not working");
  }
});



module.exports = { createOrder };
