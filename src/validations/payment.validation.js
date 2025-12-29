const Joi = require('joi');

exports.verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  totalAmount: Joi.number().min(1).required(),
  deliveryCharge: Joi.number().min(0).default(0),
  address: Joi.string().length(24).hex().required(),

  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required(),
        quantity: Joi.number().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});
