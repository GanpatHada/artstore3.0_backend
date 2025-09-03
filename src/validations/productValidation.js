import Joi from "joi";

export const productValidation = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.base": "Title must be a string",
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required"
  }),

  category: Joi.string().valid(
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
    "OTHERS"
  ).required().messages({
    "any.only": "Category must be one of MADHUBANI, PHAD, WARLI, MINIATURE, PITHORA, GOND, PATTACHITRA, MUGHAL, TANJORE, KERALA MURAL, KALIGHAT, or OTHERS",
    "any.required": "Category is required"
  }),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required"
  }),

  discount: Joi.number().min(0).max(100).default(0).messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100"
  }),

  actualPrice: Joi.number().positive().required().messages({
    "number.base": "Actual price must be a number",
    "number.positive": "Actual price must be greater than 0",
    "any.required": "Actual price is required"
  }),

  descriptions: Joi.alternatives().try(
    Joi.array().items(
      Joi.string().min(10).messages({
        "string.base": "Each description must be a string",
        "string.min": "Each description must be at least 10 characters long"
      })
    ).min(4),
    Joi.string().custom((value, helpers) => {
      try {
        const arr = JSON.parse(value);
        if (!Array.isArray(arr) || arr.length < 4) {
          return helpers.error("array.min");
        }
        return arr;
      } catch {
        return helpers.error("any.invalid");
      }
    })
  ).required().messages({
    "array.base": "Descriptions must be an array",
    "array.min": "At least 4 descriptions are required",
    "any.required": "Descriptions field is required"
  }),

  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      try {
        return JSON.parse(value);
      } catch {
        return helpers.error("any.invalid");
      }
    })
  ).optional(),

  dimensions: Joi.alternatives().try(
    Joi.object({
      height: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      thickness: Joi.number().positive().required()
    }),
    Joi.string().custom((value, helpers) => {
      try {
        return JSON.parse(value);
      } catch {
        return helpers.error("any.invalid");
      }
    })
  ).required().messages({
    "object.base": "Dimensions must be an object",
    "any.required": "Dimensions are required"
  }),

  medium: Joi.string().required().messages({
    "string.base": "Medium must be a string",
    "any.required": "Medium is required"
  }),

  surface: Joi.string().required().messages({
    "string.base": "Surface must be a string",
    "any.required": "Surface is required"
  }),

  weight: Joi.number().positive().required().messages({
    "number.base": "Weight must be a number",
    "number.positive": "Weight must be greater than 0",
    "any.required": "Weight is required"
  }),

  bankOffers: Joi.alternatives().try(
    Joi.array().items(
      Joi.object({
        bank: Joi.string().required(),
        discount: Joi.number().min(0).max(100).required(),
        details: Joi.string().required()
      })
    ),
    Joi.string().custom((value, helpers) => {
      try {
        return JSON.parse(value);
      } catch {
        return helpers.error("any.invalid");
      }
    })
  ).required().messages({
    "array.base": "Bank offers must be an array (or JSON string)",
    "any.required": "Bank offers field is required"
  }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock is required"
  })
}).unknown(false); 
