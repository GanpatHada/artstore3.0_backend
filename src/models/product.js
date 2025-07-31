const mongoose = require("mongoose");
const reviewSchema = require("./review");


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
    descriptions: {
      required: true,
      type: [String],
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
  if (this.isModified("discount")) {
    const discountAmount = Math.floor((this.discount / 100) * this.actualPrice);
    this.price = Math.floor(this.actualPrice - discountAmount);
  }
  next();
});

productSchema.methods.updateAverageRating = function () {
  const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.averageRatings = this.reviews.length === 0
    ? 0
    : parseFloat((total / this.reviews.length).toFixed(1));
};

const Product = mongoose.model("Product", productSchema);
module.exports =  Product;
