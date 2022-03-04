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
  if (!validator.isEmail(email)) return res.send(errResponse(baseResponse.INVALID_EMAIL_TYPE));

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
  if (nickname.length > 10) return res.send(errResponse(baseResponse.EXCEED_NICKNAME));

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
  if (nickname.length > 10) return res.send(errResponse(baseResponse.EXCEED_NICKNAME));

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

/*
  API No. 1.7
  API Name: 자동로그인 API
  [POST] /login/auto
*/
exports.autoLogin = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const autoLogin = await authProvider.autoLogin(userIdx);
  return res.send(autoLogin);
}

/*
  API No. 13.1
  API Name: 사용자 권한 판단 API
  [GET] /users/auth
*/
exports.getUserAuth = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getUserAuth = await authProvider.getUserAuth(userIdx);
  return res.send(getUserAuth);
}

/*
  API No. 1.7
  API Name: 회원 탈퇴 API
  [DELETE] /users
*/
exports.deleteUser = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const deleteUser = await authService.deleteUser(userIdx);
  return res.send(deleteUser);
}