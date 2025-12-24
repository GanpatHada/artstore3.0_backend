function errorHandler(error, _, res, _) {
  console.error(error.stack);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "something went wrong",
    errorCode: error.errorCode || "INTERNAL_ERROR",
    errors: error.errors || [],
    status: error.statusCode || 500,
  });
}
module.exports = errorHandler;
