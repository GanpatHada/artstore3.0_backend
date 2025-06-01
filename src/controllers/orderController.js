const { customAlphabet } = require("nanoid");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asynchandler");
const razorpay = require("../config/rzp.config");
const ApiResponse = require("../utils/ApiResponse");
const { alphaNumber } = require("../Constants");
const { getProvidedSignature } = require("../helpers/order.helper");
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");

const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount) throw new ApiError(400, "Amount not given");

  const getUniqueReceiptNo = customAlphabet(alphaNumber, 12);

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


const getOrderDetails = asyncHandler(async(req,res)=>{
  const orderId=req.params.orderId; 
  if(!orderId)
    throw new ApiError(400,"Orderid not given");
  const order=await Order.findById(orderId); 
  const user=await User.findById(req._id);
  const deliveryAddress=user.addresses.find(address=>address._id.toString()===order.shippingAddress.toString());
  return res.status(200).json(new ApiResponse(200,{order,deliveryAddress},"order fetched successfully"))
})

const verifyandSavePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, products, shippingAddress,totalAmount,deliveryCharge } = req.body;
  if (
    [orderId, paymentId, signature, products, shippingAddress,totalAmount,deliveryCharge].some(
      (field) => field?.length === 0 || field === undefined
    )
  ) {
    throw new ApiError(400, "required fields are empty or not found");
  }
  const generatedSignature = getProvidedSignature(orderId, paymentId);

  if (generatedSignature !== signature) {
    throw new ApiError(400, "Invalid payment signature");
  }
  const order = await Order.create({
    orderId,
    paymentId,
    signature,
    products,
    shippingAddress,
    buyerId: req._id,
    deliveryCharge,
    totalAmount:totalAmount/100
  });
  await User.findByIdAndUpdate( req._id,{ $addToSet: { myOrders: order._id } });
  return res.status(201).json(new ApiResponse(201,order,"Your Order has been placed"))
});

module.exports = { createOrder, verifyandSavePayment,getOrderDetails };
