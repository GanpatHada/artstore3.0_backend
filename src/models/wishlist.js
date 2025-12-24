const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    note: {
      type: {
        comment: {
          type: String,
          default: "",
        },
        priority: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium",
        },
      },
      default: null,
    },
  },
  { timestamps: true, _id: false },
);

const wishlistSchema = new mongoose.Schema({
  listName: {
    type: String,
    required: true,
    trim: true,
  },
  privacy: {
    type: String,
    enum: ["Private", "Public", "Shared"],
    default: "Private",
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    default: "",
    trim: true,
  },
  items: [wishlistItemSchema],
});

module.exports = { wishlistSchema };
