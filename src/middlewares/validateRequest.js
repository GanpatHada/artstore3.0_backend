const ApiError = require("../utils/ApiError");

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new ApiError(400,error.details[0].message);
    }
    next();
  };

module.exports=validateRequest  