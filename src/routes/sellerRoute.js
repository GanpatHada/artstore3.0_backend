const express=require('express');
const { registerSeller } = require('../controllers/sellerController');
const router=express.Router();

router.route("/register").post(registerSeller)

module.exports=router;