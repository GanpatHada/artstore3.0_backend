const ApiError = require("../utils/ApiError");

const validateRequest = (schema) => (req,_, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    throw new ApiError(
      400,
      error.details[0].message,
      "VALIDATION_FAILED"
    );
  }

  req.body = value;
  next();
};

module.exports = validateRequest;
