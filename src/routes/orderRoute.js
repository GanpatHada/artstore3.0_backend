const express=require('express');
const { createOrder, verifyandSavePayment, getOrderDetails,} = require('../controllers/orderController');
const router=express.Router();
const verifyJwt=require("./../middlewares/auth.js")

router.route("/").post(createOrder);
router.route("/doPayment").post(verifyJwt,verifyandSavePayment);
router.route("/:orderId").get(verifyJwt,getOrderDetails)

module.exports=router