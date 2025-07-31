const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    rating: Number,
    review: String,
  },
  { timestamps: true }
);

module.exports=reviewSchema