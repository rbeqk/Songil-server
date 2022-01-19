const authProvider = require('./authProvider');
const authService = require('./authService');
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

/*
  API No. 1.2
  API Name: 이메일 인증번호 확인 API
  [GET] /auth
  query: email, code
*/
exports.checkVerificationCode = async (req, res) => {
  const {email, code} = req.query;

  if (!(email && code)) return res.send(errResponse(baseResponse.IS_EMPTY));

  const checkVerificationCode = await authProvider.checkVerificationCode(email, code);

  return res.send(checkVerificationCode);
}

/*
  API No. 1.3
  API Name: 닉네임 중복 체크 API
  [GET] /auth/duplicated-check
  query: nickname
*/
exports.checkNickname = async (req, res) => {
  const {nickname} = req.query;

  if (!nickname) return res.send(errResponse(baseResponse.IS_EMPTY));

  const checkNickname = await authProvider.checkNickname(nickname);

  return res.send(checkNickname);
}

/*
  API No. 1.4
  API Name: 회원가입 API
  [POST] /signup
  body: email, password, nickname
*/
exports.createUser = async (req, res) => {
  const {email, password, nickname} = req.body;

  if (!(email && password && nickname)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!validator.isEmail(email)) return res.send(errResponse(baseResponse.INVALID_EMAIL_TYPE));

  const createUser = await authService.createUser(email, password, nickname);

  return res.send(createUser);
}

/*
  API No. 1.5
  API Name: 로그인 API
  [POST] /login
  body: email, password
*/
exports.login = async (req, res) => {
  const {email, password} = req.body;

  if (!(email && password)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!validator.isEmail(email)) return res.send(errResponse(baseResponse.INVALID_EMAIL_TYPE));

  const login = await authProvider.login(email, password);

  return res.send(login);
}