const mongoose = require("mongoose");
const { addressSchema } = require("./address");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cartItemSchema } = require("./cart");
const { wishlistSchema } = require("./wishlist");



const userSchema = new mongoose.Schema(
  {
    fullName: {
      required: true,
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default:null
    },
    refreshToken: {
      type: String,
    },
    viewedItems:[{
      type:mongoose.Types.ObjectId,
      ref:'Product'
    }],
    addresses: [addressSchema],
    cart: [cartItemSchema],
    wishlists: [wishlistSchema],
    myOrders:[{
      type:mongoose.Types.ObjectId,
      ref:"Order"
    }]
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isNew && (!this.wishlists || this.wishlists.length === 0)) {
  this.wishlists = [{
    listName: "Shopping List",
    isDefault: true,
    privacy: "Private",
    items: []
  }];
}

  next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
