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
    .select("isActive title productImages createdAt stockSold stock price actualPrice discount surface medium");
    return res
      .status(200)
      .json(new ApiResponse(200, products, "seller products found"));
});


// ================= Get seller products stats ======================




const getSellerProductStats = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;

  const products = await Product.find({ artist: sellerId }).lean();

  let totalProducts = products.length;
  let totalStockAdded = 0;
  let totalSold = 0;
  let remainingStock = 0;
  let availableProducts = 0;
  let unavailableProducts = 0;

  products.forEach((product) => {
    const stock = product.stock ?? 0;
    const sold = product.stockSold ?? 0;

    totalStockAdded += stock + sold;
    totalSold += sold;
    remainingStock += stock;

    if (product.isActive) {
      availableProducts++;
    } else {
      unavailableProducts++;
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalProducts,
        totalStockAdded,
        totalSold,
        remainingStock,
        availableProducts,
        unavailableProducts,
      },
      "Seller product stats fetched successfully"
    )
  );
});






module.exports = { sellerDetails, getSellerProducts,getSellerProductStats };