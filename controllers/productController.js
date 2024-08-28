const Product = require("../models/product");

async function addProduct(productDetails) {
  try {
    const product = new Product(productDetails);
    const savedProduct = await product.save();
    if (savedProduct)
      return { status: 200, message: "product added successfuly" };
    return { status: 401, message: "something went wrong" };
  } catch (error) {
    throw error;
  }
}

module.exports = { addProduct };
