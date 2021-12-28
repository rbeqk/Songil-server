module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const homeController = require('./homeController');

  //홈 화면 조회 API
  app.get('/home', homeController.getHome);
}