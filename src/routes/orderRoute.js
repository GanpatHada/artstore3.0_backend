const express=require('express');
const { createOrder,getOrderDetails, verifyPayment,} = require('../controllers/orderController');
const router=express.Router();
const verifyJwt=require("./../middlewares/auth.js");
const validateRequest = require('../middlewares/validateRequest.js');
const { verifyPaymentSchema } = require('../validations/payment.validation.js');

router.route("/").post(createOrder);
router.route("/verifyPayment").post(verifyJwt,validateRequest(verifyPaymentSchema),verifyPayment)
router.route("/:orderId").get(verifyJwt,getOrderDetails)

module.exports=router