const { customAlphabet } = require('nanoid');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asynchandler');
const razorpay = require('../config/rzp.config');
const ApiResponse = require('../utils/ApiResponse');
const { alphaNumber } = require('../Constants');
const { verifySignature } = require('../helpers/order.helper');
const Order = require('../models/order');
const Product = require('../models/product');

/* ================== CREATE ORDER (RAZORPAY) ================== */

const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    throw new ApiError(400, 'Amount not given', 'AMOUNT_MISSING');
  }

  const getUniqueReceiptNo = customAlphabet(alphaNumber, 12);

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: `RECNO${getUniqueReceiptNo()}`,
    notes: {
      createdBy: req.user._id.toString(),
      time: Date.now(),
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return res
      .status(201)
      .json(new ApiResponse(201, order, 'Order created successfully'));
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new ApiError(500, 'Payment gateway not working', 'RAZORPAY_FAILURE');
  }
});

/* ================== HELPERS ================== */

const mapOrderedItems = async (productsList) => {
  const orderedItems = [];

  for (const item of productsList) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!product.isActive) {
      throw new ApiError(400, 'Product not available', 'PRODUCT_NOT_AVAILABLE');
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, 'Stock not enough', 'STOCK_NOT_ENOUGH');
    }

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
    (addr) => addr._id.toString() === addressId.toString(),
  );

  if (!address) {
    throw new ApiError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
  }

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

/* ================== ATOMIC STOCK UPDATE ================== */

const updateStocks = async (products) => {
  for (const item of products) {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.quantity }, // 🔒 prevents overselling
      },
      {
        $inc: {
          stock: -item.quantity,
          stockSold: item.quantity,
        },
      },
      { new: true },
    );

    if (!updatedProduct) {
      throw new ApiError(400, 'Stock not available', 'STOCK_NOT_ENOUGH');
    }

    // auto deactivate if stock becomes 0
    if (updatedProduct.stock === 0 && updatedProduct.isActive) {
      updatedProduct.isActive = false;
      await updatedProduct.save();
    }
  }
};

/* ================== VERIFY PAYMENT & PLACE ORDER ================== */

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

  const isSignatureValid = verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (!isSignatureValid) {
    throw new ApiError(400, 'Invalid payment credential', 'SIGNATURE_MISMATCH');
  }

  // Prepare order data
  const orderedItems = await mapOrderedItems(products);
  const shippingAddress = getAddressDetails(user, addressId);

  // Create order
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
      method: 'Razorpay',
      status: 'Paid',
    },
  });

  // Update stock safely (atomic)
  await updateStocks(products);

  // Update user data
  user.myOrders.push(order._id);
  user.cart = user.cart.filter(
    (item) =>
      !products.some((p) => p.productId.toString() === item.product.toString()),
  );
  await user.save();

  // Enrich ordered items with user's review
  const enrichedItems = await Promise.all(
    order.orderedItems.map(async (item) => {
      const product = await Product.findById(item.product);
      const myReview = product?.reviews.find(
        (rev) => rev.user.toString() === userId.toString(),
      );

      return {
        ...item.toObject(),
        myReview: myReview || null,
      };
    }),
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        ...order.toObject(),
        orderedItems: enrichedItems,
        updatedCart: user.cart,
        updatedMyOrders: user.myOrders,
      },
      'Payment successful & order placed',
    ),
  );
});

/* ================== GET ORDER DETAILS ================== */

const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new ApiError(400, 'OrderId not given', 'ORDER_ID_MISSING');
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order fetched successfully'));
});

module.exports = {
  createOrder,
  verifyPayment,
  getOrderDetails,
};
