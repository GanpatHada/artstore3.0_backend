const Joi = require("joi");

const productValidation = Joi.object({
  title: Joi.string().min(10).max(100).required().messages({
    "string.base": "Title must be a string",
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),

  category: Joi.string()
    .valid(
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
    )
    .required()
    .messages({
      "any.only":
        "Category must be one of MADHUBANI, PHAD, WARLI, MINIATURE, PITHORA, GOND, PATTACHITRA, MUGHAL, TANJORE, KERALA MURAL, KALIGHAT, or OTHERS",
      "any.required": "Category is required",
    }),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),

  discount: Joi.number().min(0).max(100).default(0).messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),

  actualPrice: Joi.number().positive().required().messages({
    "number.base": "Actual price must be a number",
    "number.positive": "Actual price must be greater than 0",
    "any.required": "Actual price is required",
  }),

  descriptions: Joi.alternatives()
    .try(
      Joi.array()
        .items(
          Joi.string().min(10).messages({
            "string.base": "Each description must be a string",
            "string.min":
              "Each description must be at least 10 characters long",
          }),
        )
        .min(4),
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
      }),
    )
    .required()
    .messages({
      "array.base": "Descriptions must be an array",
      "array.min": "At least 4 descriptions are required",
      "any.required": "Descriptions field is required",
    }),

  dimensions: Joi.alternatives()
    .try(
      Joi.object({
        height: Joi.string().required(),
        width: Joi.string().required(),
        thickness: Joi.string().required(),
      }),
      Joi.string().custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);

          const { error } = Joi.object({
            height: Joi.string().required(),
            width: Joi.string().required(),
            thickness: Joi.string().required(),
          }).validate(parsed);

          if (error) {
            return helpers.error("any.invalid");
          }

          return parsed;
        } catch {
          return helpers.error("any.invalid");
        }
      }),
    )
    .required()
    .messages({
      "object.base": "Dimensions must be an object",
      "any.required": "Dimensions are required",
      "any.invalid":
        "Dimensions must be a valid object with height, width, and thickness",
    }),

  medium: Joi.string().required().messages({
    "string.base": "Medium must be a string",
    "any.required": "Medium is required",
  }),

  surface: Joi.string().required().messages({
    "string.base": "Surface must be a string",
    "any.required": "Surface is required",
  }),

  weight: Joi.string()
    .pattern(/^\d+(\.\d+)?\s?gm$/i)
    .required()
    .messages({
      "string.pattern.base":
        "Weight must be a valid number followed by 'gm' (e.g. '12 gm', '2.5 gm')",
      "any.required": "Weight is required",
    }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock is required",
  }),
  productImages: Joi.any(),
}).unknown(false);

module.exports = { productValidation };
