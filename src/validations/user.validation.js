const Joi = require("joi");

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
    "string.empty": "Email is empty",
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

module.exports = { loginValidation, registerValidation };
