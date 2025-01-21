function errorHandler(error, req, res, next) {
  console.error(error.stack);
  res
    .status(error.statusCode || 500)
    .json({
      message: "Internal server error",
      data: error.data,
      success: error.success,
      error:{
        code:error.code,
        details:error.message
      }
    });
}
module.exports = errorHandler;
