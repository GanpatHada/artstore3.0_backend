const mongoose = require("mongoose");
const { addressSchema } = require("./address");

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    price: {
      required: true,
      type: Number,
    },
    discount: {
      default: 0,
      type: Number,
    },
    actualPrice: {
      type: Number,
    },
    ratings: [
      {
        rating: {
          required: true,
          type: Number,
        },
        userId: {
          required: true,
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    reviews: [
      {
        review: {
          required: true,
          type: String,
        },
        userId: {
          required: true,
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  if (!this.isModified("discount"))return next();

  const discountAmount=Math.floor((this.discount/100)*this.price)

  this.actualPrice = Math.floor(this.price-discountAmount);
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
