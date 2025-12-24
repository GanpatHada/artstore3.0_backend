const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    businessLogo: {
      type: String,
      default: null,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    bankDetails: {
      accountHolderName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      ifscCode: {
        type: String,
        required: true,
        uppercase: true,
      },
    },

    aadhaarNumber: {
      type: String,
      required: true,
    },

    panNumber: {
      type: String,
      required: true,
      uppercase: true,
    },

    gstin: {
      type: String,
      default: null,
      uppercase: true,
    },

    businessType: {
      type: String,
      enum: [
        "Individual",
        "Proprietorship",
        "Partnership",
        "LLP",
        "Private Limited",
      ],
      default: "Individual",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
);

storeSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

storeSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
