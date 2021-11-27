module.exports = function(app){
  const userController = require("./userController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //로그인 시 인증번호 발급 API
  app.post('/auth/login', userController.getVerificationCodeWhenLogin);

  //회원가입 시 인증번호 발급 API
  app.post('/auth', userController.getVerificationCode);

  //회원가입 시 인증번호 확인 API
  app.get('/auth', userController.verifyVerficationCode);

  //핸드폰 번호 및 닉네임 중복 체크 API
  app.get('/auth/duplicated-check', userController.checkDuplicated);

  //회원가입 API
  app.post('/signup', userController.signUp);

  //자동로그인 API
  app.post('/login/auto', jwtMiddleware, userController.autoLogin);

  //로그인 API
  app.post('/login', userController.login);
}