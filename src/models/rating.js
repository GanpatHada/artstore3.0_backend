const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  rating: {
    required: true,
    type: Number,
  },
  userId: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});
 
module.exports=RatingSchema
