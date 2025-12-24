const Joi = require("joi");

const storeValidation = Joi.object({
  businessName: Joi.string().min(3).max(100).required(),

  // file handled by multer → allow anything or nothing
  businessLogo: Joi.any().optional().allow(null),

  ownerName: Joi.string().min(3).max(100).required(),

  contactEmail: Joi.string().email().required(),

  contactPhone: Joi.string().min(10).max(15).required(),

  // Address
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().default("India"),

  // Bank
  accountHolderName: Joi.string().required(),
  accountNumber: Joi.string().required(),
  ifscCode: Joi.string().required(),

  // KYC
  aadhaarNumber: Joi.string()
    .pattern(/^[0-9]{12}$/)
    .required(),

  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .required(),

  // ✅ GSTIN logic
  gstin: Joi.alternatives()
    .try(
      Joi.string().length(15), // if provided → validate
      Joi.valid(null), // explicit null
      Joi.valid("null"), // FormData "null"
    )
    .optional(),

  businessType: Joi.string()
    .valid(
      "Individual",
      "Proprietorship",
      "Partnership",
      "LLP",
      "Private Limited",
    )
    .default("Individual"),
}).unknown(false);

module.exports = { storeValidation };
