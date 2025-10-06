const { customAlphabet } = require("nanoid");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asynchandler");
const razorpay = require("../config/rzp.config");
const ApiResponse = require("../utils/ApiResponse");
const { alphaNumber } = require("../Constants");
const {verifySignature } = require("../helpers/order.helper");
const Order = require("../models/order");
const Product = require("../models/product");

//==================@create order before payment================================

const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount) throw new ApiError(400, "Amount not given", "AMOUNT_MISSING");

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

//------------------------------------------------------------------------------------


const mapOrderedItems = async (productsList) => {
  const orderedItems = [];

  for (const item of productsList) {
    const product = await Product.findById(item.productId);
    if (!product)
      throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
    if (!product.isActive)
      throw new ApiError(404, "Product not available", "PRODUCT_NOT_AVAILABLE");
    if (product.stock < item.quantity)
      throw new ApiError(404, "Stock is not enough", "STOCK_NOT_ENOUGH");

    orderedItems.push({
      product: product._id,
      name: product.title,
      image: product.productImages[0],
      price: product.price,
      quantity: item.quantity,
    });
  }

  return orderedItems;
};

const getAddressDetails = (user, addressId) => {
  const address = user.addresses.find(
    (address) => address._id.toString() === addressId.toString()
  );
  if (!address)
    throw new ApiError(404, "Address not found", "ADDRESS_NOT_FOUND");

  return {
    fullName: address.receiverName,
    phone: address.mobileNumber,
    street:
      `${address.address1}, ${address.address2}, ${address.landmark}`.trim(),
    city: address.city,
    state: address.state,
    pincode: address.pinCode,
  };
};

//=======================@ Do Payment here ===================================

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

  const user = req.user;
  const userId = user._id;

  const signatureVerified = verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  if (!signatureVerified)
    throw new ApiError(400, "Invalid payment credential", "SIGNATURE_MISSMATCH");

  const orderedItems = await mapOrderedItems(products);
  const shippingAddress = getAddressDetails(user, addressId);

  const order = await Order.create({
    user: userId,
    orderedItems,
    shippingAddress,
    totalAmount: totalAmount / 100,
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
  });

  user.myOrders.push(order._id);
  user.cart = user.cart.filter(
    (item) =>
      !products.some(
        (p) => p.productId.toString() === item.product.toString()
      )
  );
  await user.save();

  await Promise.all(
    products.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  const enrichedItems = await Promise.all(
    order.orderedItems.map(async (item) => {
      const product = await Product.findById(item.product);
      const myReview = product.reviews.find(
        (rev) => rev.user.toString() === userId.toString()
      );

      return {
        ...item.toObject(),
        myReview: myReview || null,
      };
    })
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        ...order.toObject(),
        orderedItems: enrichedItems,
        updatedCart: user.cart,
        updatedMyOrders: user.myOrders,
      },
      "Payment is done and order is placed successfully"
    )
  );
});


const getOrderDetails = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  if (!orderId) throw new ApiError(400, "Orderid not given");
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(400, "Order not found");
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order fetched successfully"));
});

module.exports = { createOrder, verifyPayment, getOrderDetails };
