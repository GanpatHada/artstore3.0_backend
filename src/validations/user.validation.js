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
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
    "string.empty": "Email is empty",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is empty",
  }),
  fullName: Joi.string().email().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name is empty",
  }),
  Phone: Joi.string().min(6).required().messages({
    "any.required": "Phone number is required",
    "string.empty": "Phone number is empty",
  }),
});

module.exports = { loginValidation,registerValidation };
