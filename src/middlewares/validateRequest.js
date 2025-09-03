const ApiError = require("../utils/ApiError");

const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map((err) => err.message);
    throw new ApiError(400, "Validation error", "VALIDATION_FAILED", messages);
  }
  req.body = value;

  next();
};

module.exports = validateRequest;

