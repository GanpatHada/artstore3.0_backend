const Joi = require("joi");

const addressValidation = Joi.object({
  receiverName: Joi.string().trim().required().messages({
    "any.required": "Receiver name is required",
    "string.empty": "Receiver name cannot be empty",
  }),
  mobileNumber: Joi.string().trim().required().messages({
    "any.required": "Mobile number is required",
    "string.empty": "Mobile number cannot be empty",
  }),
  pinCode: Joi.string().trim().required().messages({
    "any.required": "Pin code is required",
    "string.empty": "Pin code cannot be empty",
  }),
  address1: Joi.string().trim().required().messages({
    "any.required": "Address1 is required",
    "string.empty": "Address1 cannot be empty",
  }),
  address2: Joi.string().trim().required().messages({
    "any.required": "Address2 is required",
    "string.empty": "Address2 cannot be empty",
  }),
  landmark: Joi.string().trim().allow("", null),
  city: Joi.string().trim().required().messages({
    "any.required": "City is required",
    "string.empty": "City cannot be empty",
  }),
  state: Joi.string().trim().required().messages({
    "any.required": "State is required",
    "string.empty": "State cannot be empty",
  }),
  country: Joi.string().trim().required().messages({
    "any.required": "Country is required",
    "string.empty": "Country cannot be empty",
  }),
})
  .unknown(false)
  .messages({
    "object.unknown": "Extra field '{{#label}}' is not allowed",
  });

module.exports = addressValidation;
