const ApiError = require("../utils/ApiError");

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((err) => err.message);
    throw new ApiError(400, "Validation error", "VALIDATION_FAILED", messages);
  }

  next();
};

module.exports = validateRequest;
