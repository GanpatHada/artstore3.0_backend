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
    const products = await Product.find({ artist: seller._id })
    .select("isActive title productImages createdAt initialStock stock price actualPrice discount");
    return res
      .status(200)
      .json(new ApiResponse(200, products, "seller products found"));
});


// ================= Get seller products stats ======================




const getSellerProductStats = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;

  const products = await Product.find({ artist: sellerId }).lean();

  const totalProducts = products.length;
  const totalQuantity = products.reduce((acc, p) => acc + (p.initialStock || 0), 0); // ✅ total quantity
  const soldProducts = products.reduce((acc, p) => acc + ((p.initialStock || 0) - (p.stock || 0)), 0);
  const unsoldProducts = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const availableProducts = products.filter(p => p.isActive).length;
  const unavailableProducts = products.filter(p => !p.isActive).length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalProducts,
        totalQuantity,
        soldProducts,
        unsoldProducts,
        availableProducts,
        unavailableProducts
      },
      "Seller product stats fetched successfully"
    )
  );
});





module.exports = { sellerDetails, getSellerProducts,getSellerProductStats };