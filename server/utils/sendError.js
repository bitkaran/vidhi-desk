// for-lawyers/server/utils/sendError.js
const sendError = (res, statusCode, message) => {

  return res.status(statusCode).json({
    success: false,

    message,
  });
};

module.exports = sendError;
