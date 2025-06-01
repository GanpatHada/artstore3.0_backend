const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    rating: Number,
    review: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    productImages: {
      required: true,
      type: [String],
    },
    description: {
      required: true,
      type: String,
    },
    dimensions: {
      height: {
        required: true,
        type: Number,
      },
      width: {
        required: true,
        type: Number,
      },
      thickness: {
        required: true,
        type: Number,
      },
    },
    category: {
      required: true,
      type: String,
      enum: [
        "MADHUBANI",
        "PHAD",
        "WARLI",
        "MINIATURE",
        "PITHORA",
        "GOND",
        "PATTACHITRA",
        "MUGHAL",
        "TANJORE",
        "KERALA MURAL",
        "KALIGHAT",
        "OTHERS",
      ],
    },
    artist: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "Seller",
    },
    price: {
      type: Number,
    },
    discount: {
      default: 0,
      type: Number,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    isSold: {
      required: true,
      type: Boolean,
      default: false,
    },
    weight: {
      required: true,
      type: Number,
    },
    medium: {
      required: true,
      type: String,
    },
    surface: {
      required: true,
      type: String,
    },
    averageRatings:{
      type:Number,
      default:0
    },
    reviews: [reviewSchema],
    tags: [{ type: String, enum: ["LIMITED TIME DEAL", "ARTSTORE PRIME"] }],
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  if (!this.isModified("discount")) return next();

  const discountAmount = Math.floor((this.discount / 100) * this.actualPrice);

  this.price = Math.floor(this.actualPrice - discountAmount);
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports =  Product;
