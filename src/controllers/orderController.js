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

  if (!amount)
    throw new ApiError(400, "Amount not given", "AMOUNT_MISSING");

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
    console.error("Razorpay order creation failed:", error);
    throw new ApiError(500, "Payment gateway not working", "RAZORPAY_FAILURE");
  }
});

const verifySignature = (orderId, paymentId, signature) => {
  const generatedSignature = getProvidedSignature(orderId, paymentId);
  return (generatedSignature == signature)
}

const mapOrderedItems = async (productsList) => {
  const orderedItems = [];

  for (const item of productsList) {
    const product = await Product.findById(item.productId);
    if (!product)
      throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
    orderedItems.push({
      product: product._id,
      name: product.title,
      image: product.productImages[0],
      price: product.price,
      quantity: item.quantity,
    });
  }
  return orderedItems;

}

const getAddressDetails = async (userId, addressId) => {
  const user = await User.findById(userId);
  const address = user.addresses.find(
    (address) => address._id.toString() === addressId.toString()
  );
  if (!address) {
    throw new ApiError(404, "Address not found", "ADDRESS_NOT_FOUND");
  }
  return {
    fullName: address.receiverName,
    phone: address.mobileNumber,
    street: `${address.address1}, ${address.address2}`,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
};

const verifyPayment = asyncHandler(async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    address: addressId,
    products,
    totalAmount,
    deliveryCharge,
  } = req.body;

  const userId = req._id;

  const signatureVerified = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!signatureVerified)
    throw new ApiError(400, "Invalid payment credential", "SIGNATURE_MISSMATCH")
    const orderedItems = await mapOrderedItems(products);
    const shippingAddress = await getAddressDetails(userId, addressId);
    const order = await Order.create({
      user: userId,
      orderedItems,
      shippingAddress,
      totalAmount,
      deliveryCharge,
      isPaid: true,
      paidAt: new Date(),
      paymentInfo: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        method: "Razorpay",
        status: "Paid",
      },
      status: "Pending",
    });
    await User.findByIdAndUpdate(userId, {
      $push: { myOrders: order._id },
    });

    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }
    res.status(201).json(new ApiResponse(201, order, "Order Created successfully"));
})


const getOrderDetails = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  if (!orderId)
    throw new ApiError(400, "Orderid not given");
  const order = await Order.findById(orderId);
  const user = await User.findById(req._id);
  const deliveryAddress = user.addresses.find(address => address._id.toString() === order.shippingAddress.toString());
  return res.status(200).json(new ApiResponse(200, { order, deliveryAddress }, "order fetched successfully"))
})



module.exports = { createOrder, verifyPayment, getOrderDetails };
