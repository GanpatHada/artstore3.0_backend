const Product = require("../models/product");
const Seller = require("../models/seller");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asynchandler");


// ================= Seller details ======================


const sellerDetails = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.seller._id).select("-password -refreshToken -createdAt -updatedAt -__v");

    return res
      .status(200)
      .json(new ApiResponse(200, seller, "seller details found"));
    
  
});


// ================= Get seller products ======================


const getSellerProducts = asyncHandler(async (req, res) => {
    const seller = req.seller;
    const products = await Product.find({ artist: seller._id }).select("-__v -reviews -bankOffers ");
    return res
      .status(200)
      .json(new ApiResponse(200, products, "seller products found"));
});



module.exports = { sellerDetails, getSellerProducts };