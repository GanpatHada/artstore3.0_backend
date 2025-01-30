const express=require('express');
const { createOrder } = require('../controllers/orderController');
const router=express.Router();

router.route("/").post(createOrder);

module.exports=router