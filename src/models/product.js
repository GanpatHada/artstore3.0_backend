const mongoose = require("mongoose");
const reviewSchema = require("./review");

const bankOfferSchema = new mongoose.Schema(
  {
    bank: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);


const dimensionsSchema = new mongoose.Schema(
  {
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    thickness: { type: Number, required: true },
  },
  { _id: false }
);


const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    productImages: {
      type: [String],
      required: true,
    },

    descriptions: {
      type: [String],
      required: true,
    },

    bankOffers: {
      type: [bankOfferSchema],
      default: [],
    },

    dimensions: {
      type: dimensionsSchema,
      required: true,
    },

    category: {
      type: String,
      required: true,
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
      type: mongoose.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    price: {
      type: Number,
    },

    discount: {
      type: Number,
      default: 0,
    },

    actualPrice: {
      type: Number,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    medium: {
      type: String,
      required: true,
      trim: true,
    },

    surface: {
      type: String,
      required: true,
      trim: true,
    },

    averageRatings: {
      type: Number,
      default: 0,
    },

    reviews: [reviewSchema],

    tags: [
      {
        type: String,
        enum: ["LIMITED TIME DEAL", "ARTSTORE PRIME"],
      },
    ],
  },
  { timestamps: true }
);


productSchema.pre("save", function (next) {
  if (this.isModified("discount") || this.isModified("actualPrice")) {
    const discountAmount = Math.floor((this.discount / 100) * this.actualPrice);
    this.price = Math.floor(this.actualPrice - discountAmount);
  }
  next();
});


productSchema.methods.updateAverageRating = function () {
  const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.averageRatings =
    this.reviews.length === 0
      ? 0
      : parseFloat((total / this.reviews.length).toFixed(1));
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
