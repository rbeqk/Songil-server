const authProvider = require('./authProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const validator = require("validator");

/*
  API No. 1.1
  API Name: 이메일 인증번호 발급 API
  [POST] /auth
  body: email
*/
exports.createVerificationCode = async (req, res) => {
  const {email} = req.body;
  
  if (!email) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!validator.isEmail(email)) return res.send(errResponse(baseResponse.INVALID_EMAIL_TYPE));

  const verificationCode = await authProvider.createVerificationCode(email);

  return res.send(verificationCode);
}