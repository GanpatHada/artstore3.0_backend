const Joi = require("joi");

const loginValidation = Joi.object({
  emailOrPhone: Joi.string()
    .required()
    .custom((value, helpers) => {
      const isEmail = Joi.string().email().validate(value).error === undefined;
      const isPhone = /^\d{10}$/.test(value); 

      if (!isEmail && !isPhone) {
        return helpers.message(
          "Must be a valid email or 10-digit phone number"
        );
      }

      return value;
    })
    .messages({
      "any.required": "Email or phone is required",
      "string.empty": "Email or phone cannot be empty",
    }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
    "string.empty": "Password is empty",
  }),
});

const registerValidation = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
  }),
  password: Joi.string().min(6).trim().required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
  fullName: Joi.string().trim().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .trim()
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
      "string.empty": "Phone number cannot be empty",
    }),
});

const reviewValidation = Joi.object({
  sellerId: Joi.string().trim().required().messages({
    "string.empty": "sellerId cannot be empty.",
    "any.required": "sellerId is required.",
  }),
  userRatings: Joi.number().min(0).max(5).required().messages({
    "number.base": "User rating must be a number.",
    "number.min": "User rating cannot be less than 0.",
    "number.max": "User rating cannot be more than 5.",
  }),
  userReview: Joi.string().trim().required().messages({
    "string.empty": "User review cannot be empty.",
    "any.required": "User review is required.",
  }),
});

module.exports = { loginValidation, registerValidation, reviewValidation };
