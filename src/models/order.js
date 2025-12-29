const mongoose = require('mongoose');

const orderedItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    orderedItems: {
      type: [orderedItemSchema],
      required: true,
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    paymentInfo: {
      orderId: String,
      paymentId: String,
      signature: String,
      method: String,
      status: {
        type: String,
        default: 'Paid',
      },
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
