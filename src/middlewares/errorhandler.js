function errorHandler(error, req, res, next) {
  console.error(error.stack);
  res
    .status(error.statusCode || 500)
    .json({
      message: error.message,
      error: error.data,
      success: error.success,
      status:error.statusCode || 500
    });
}
module.exports = errorHandler;
