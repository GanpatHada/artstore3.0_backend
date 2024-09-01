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
    return {status:401,message:"products not found",status:false}
  } catch (error) {
    throw error;
  }
}

module.exports = { addProduct,getProducts };
