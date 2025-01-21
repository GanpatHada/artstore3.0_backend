function errorHandler(error, req, res, next) {
  console.error(error.stack);
  res
    .status(error.statusCode || 500)
    .json({
      message: error.message,
      data: error.data,
      success: error.success,
      code :error.code
    });
}
module.exports = errorHandler;
