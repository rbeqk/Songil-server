module.exports = function(app){
  const userController = require("./userController");

  app.post('/auth', userController.getVerificationCode);
  app.get('/auth', userController.verifyVerficationCode);
}