module.exports = function(app){
  const userController = require("./userController");

  app.post('/auth/login', userController.getVerificationCodeWhenLogin);

  app.post('/auth', userController.getVerificationCode);
  app.get('/auth', userController.verifyVerficationCode);
  app.get('/auth/duplicated-check', userController.checkDuplicated);
  app.post('/signup', userController.signUp);

  app.post('/login', userController.login);
}