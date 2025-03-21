const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sellerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default:null
    },
    averageRatings:{
      type:Number,
      default:0
    },
    reviews:[{
      user:{
        type:mongoose.Types.ObjectId,
        ref:'User'
      },
      userReview:String,
      userRatings:Number,
      createdAt:{
        type:Date,
        default:Date.now()
      }
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
sellerSchema.pre("save", function (next) {
  if (this.isModified("password"))
      this.password = bcrypt.hash(this.password, 10);

  if (this.isModified("reviews")) {
     const total = this.reviews.reduce((sum, review) => sum + review.userRatings, 0);
     this.averageRatings = total / this.reviews.length;
  } 
  next();
});

sellerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

sellerSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
    }
  );
};
sellerSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    }
  );
};

module.exports = mongoose.model("Seller", sellerSchema);
