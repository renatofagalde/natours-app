class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'internal server error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.contructor);
  }
}

module.exports = AppError;
