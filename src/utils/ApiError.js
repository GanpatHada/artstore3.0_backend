class ApiError extends Error {
  constructor(statusCode, message, errorCode, errors, stack) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errorCode = errorCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
