const express=require('express');
const { createOrder,getOrderDetails, verifyPayment,} = require('../controllers/orderController');
const router=express.Router();
const validateRequest = require('../middlewares/validateRequest.js');
const { verifyPaymentSchema } = require('../validations/payment.validation.js');
const { verifyUserJwt } = require('../middlewares/auth.js');

router.route("/").post(verifyUserJwt,createOrder);
router.route("/verifyPayment").post(verifyUserJwt,validateRequest(verifyPaymentSchema),verifyPayment)
router.route("/:orderId").get(getOrderDetails)

module.exports=router