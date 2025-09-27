import ApiError from "../utils/ApiError.js";

export default errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Convert non-ApiError errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], error.stack);
  }

  // Handle specific mongoose errors
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    error = new ApiError(400, "Validation Error", validationErrors);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    error = new ApiError(409, `${field} already exists`);
  }

  if (error.name === "CastError") {
    error = new ApiError(400, "Invalid ID format");
  }

  // Send error response
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    ...(error.errors?.length > 0 && { errors: error.errors }),
  };

  res.status(error.statusCode).json(response);
};
