module.exports = function(app){
  const authController = require('./authController');

  //이메일 인증번호 발급 API
  app.post('/imsi/auth', authController.createVerificationCode);

  //이메일 인증번호 확인 API
  app.get('/imsi/auth', authController.checkVerificationCode);

  //닉네임 중복 체크 API
  app.get('/imsi/auth/duplicated-check', authController.checkNickname);

  //회원가입 API
  app.post('/imsi/signup', authController.createUser);
}