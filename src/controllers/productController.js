const Product = require("../models/product");

async function addProduct(productDetails) {
  try {
    const product = new Product(productDetails);
    const savedProduct = await product.save();
    if (savedProduct)
      return { status: 201, message: "product added successfully",success:true };
    return { status: 401, message: "something went wrong",status:false };
  } catch (error) {
    throw error;
  }
}

async function getProducts(){
  try {
    const products=await Product.find();
    if(products)
      return {status:200,message:"products fetched successfully",success:true,data:products};
    return {status:401,message:"products not found",success:false,data:{}}
  } catch (error) {
    throw error;
  }
}

async function getProductsWithDiscount(discount){
  let discountInNumber=Number(discount)
  try {
    const products=await Product.find({discount: { $gte: discountInNumber}})
    return {status:200,message:"products fetched successfully",success:true,data:products}
  } catch (error) {
    throw error;
  }
}


async function getProductDetails(productId){
  try {
    const product=await Product.findById(productId).populate({path:"reviews.userId",select:"userName email"});
    if(product)
      return {status:200,message:"product details fetched successfully",success:true,data:product}
    return {status:401,message:"product details not found",success:false,data:null}
  } catch (error) {
    throw error;
  }
}

module.exports = { addProduct,getProducts,getProductDetails,getProductsWithDiscount };
