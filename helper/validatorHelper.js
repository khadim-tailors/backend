const sanitizeBody = require("express-validator");
const { sendResponse } = require("./response.helper");

function validateRequest(req, res, next, schema) {
  console.log("Inside validator request");
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: false // remove unknown props
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return sendResponse({ res, message: "Validation error", status: false, result: error.details });
  } else {
    req.body = value;
    next();
  }
}
module.exports = validateRequest;