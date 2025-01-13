const { default: mongoose } = require("mongoose");
const User = require("../models/user.js");
const { generateHash, comparePassword } = require("../utils/hashing.js");
const { createToken } = require("../utils/Token.js");
const Order = require("../models/order.js");

async function createUser(userDetails) {
  try {
    const isUserExists = await User.findOne({ email: userDetails.email });
    if (isUserExists)
      return {
        status: 400,
        message: "user already exists with this email try to login",
      };
    const hash = await generateHash(userDetails.password);
    const newUser = new User({ ...userDetails, password: hash });
    const savedUser = await newUser.save();
    const token = createToken(savedUser._id);
    return { status: 200, message: "Signup successful", token };
  } catch (error) {
    throw error;
  }
}

async function userLogin(userDetails) {
  try {
    const user = await User.findOne({ email: userDetails.email });
    if (user) {
      if (await comparePassword(user.password, userDetails.password)) {
        const token = createToken(user._id);
        return { status: 200, message: "Login successful", token };
      } else return { status: 409, message: "wrong password" };
    } else return { status: 400, message: "Email does not exists" };
  } catch (error) {
    throw error;
  }
}

async function addAddress(userId, address) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    user.addresses = [...user.addresses,address];
    await user.save();
    const recentAddress = user.addresses[user.addresses.length-1];
    return {
      status: 201,
      message: "address added successfuly",
      success: true,
      data: recentAddress,
    };
  } catch (error) {
    throw error;
  }
}


async function editAddress(userId, addressId, addressData) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    user.addresses = user.addresses.map((address) => {
      if (address._id.toString() === addressId.toString())
        return {_id:address._id,...addressData};
      return {...address};
    });
    await user.save();
    const editedAddress=user.addresses.find(address=>address._id.toString()===addressId.toString())
    return {
      status: 201,
      message: "address edited successfully",
      data: editedAddress,
      success: true,
    };
  } catch (error) {
    throw error;
  }
}


async function getUser(userId) {
  try {
    const user = await User.findById(userId).select("-password -_id").exec();
    if (!user)
      return { status: 401, message: "user not found", success: false };
    return { status: 200, message: "user found", data: user, success: true };
  } catch (error) {
    throw error;
  }
}

async function addToCart(userId, productId) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    if (user.cart.includes(productId))
      return { status: 401, message: "already in Cart", success: false };
    user.cart = [...user.cart, productId];
    await user.save();
    return {
      status: 201,
      message: "Product has been added to cart",
      success: true,
    };
  } catch (error) {
    throw error;
  }
}



async function addToWishlist(userId, productId) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    if (user.wishlist.includes(productId))
      return { status: 401, message: "already in wishlist", success: false };
    user.wishlist = [...user.wishlist, productId];
    await user.save();
    return {
      status: 201,
      message: "Product has been added to Wishlist",
      success: true,
    };
  } catch (error) {
    throw error;
  }
}
async function deleteFromCart(userId, productId) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    user.cart = user.cart.filter((prodId) => prodId.toString() !== productId);
    await user.save();
    return {
      status: 200,
      message: "product has been removed from cart",
      success: true,
    };
  } catch (error) {
    throw error;
  }
}
async function deleteFromWishlist(userId, productId) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    user.wishlist = user.wishlist.filter(
      (prodId) => prodId.toString() !== productId
    );
    await user.save();
    return {
      status: 200,
      message: "product has been removed from wishlist",
      success: true,
    };
  } catch (error) {
    throw error;
  }
}



async function markAddressDefault(userId, addressId) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    const requiredAddress = user.addresses.find(
      (address) => address._id.toString() === addressId.toString()
    );
    if (!requiredAddress)
      return { status: 401, message: "address not found", success: false };
    const remainingAddresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId.toString()
    );
    user.addresses = [requiredAddress, ...remainingAddresses];
    await user.save();
    return {
      status: 201,
      message: "address has been marked default",
      success: true,
    };
  } catch (error) {
    throw error;
  }
}

async function deleteAddress(userId, addressId) {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    const requiredAddress = user.addresses.find(
      (address) => address._id.toString() === addressId.toString()
    );
    if (!requiredAddress)
      return { status: 401, message: "address not found", success: false };
    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId.toString()
    );
    await user.save();
    return {
      status: 201,
      message: "address deleted successfully",
      success: true,
    };
  } catch (error) {
    throw error;
  }
}

async function getOrders(userId){
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: 401, message: "user not found", success: false };
    let ordersList=await Order.find({userId:userId}).populate("products");
    return {status:201,message:"orders fetched successfully",data:ordersList,success:true}
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  userLogin,
  addAddress,
  getUser,
  addToCart,
  addToWishlist,
  deleteFromCart,
  deleteFromWishlist,
  editAddress,
  markAddressDefault,
  deleteAddress,
  getOrders
};
