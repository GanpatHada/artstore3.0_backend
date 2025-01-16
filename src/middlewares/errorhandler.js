function errorHandler(error, req, res, next) {
  console.error(error.stack);
  res
    .status(error.statusCode||500)
    .json({
      message: error.message || "Internal server error",
      data: error.data,
      success: error.success,
      errors:error.errors
    });
}
module.exports = errorHandler;
