module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const authController = require('./authController');

  //이메일 인증번호 발급 API
  app.post('/auth', authController.createVerificationCode);

  //이메일 인증번호 확인 API
  app.get('/auth', authController.checkVerificationCode);

  //닉네임 중복 체크 API
  app.get('/auth/duplicated-check', authController.checkNickname);

  //회원가입 API
  app.post('/signup', authController.createUser);

  //로그인 API
  app.post('/login', authController.login);

  //자동로그인 API
  app.post('/login/auto', jwtMiddleware, authController.autoLogin);

  //사용자 권한 판단 API
  app.get('/users/type', jwtMiddleware, authController.getUserAuth);

  //회원 탈퇴 API
  app.delete('/users', jwtMiddleware, authController.deleteUser);
}