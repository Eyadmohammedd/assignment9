export const errorResponse = (
  res,
  message = "Something went wrong",
  status = 500,
  error = null
) => {
  return res.status(status).json({
    message,
    ...(error && { error }),
  });
};
