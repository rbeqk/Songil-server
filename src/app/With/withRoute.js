module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const withController = require('./withController');

  //Hot Talk 조회
  app.get('/with/hot-talk', withController.getHotTalk);
}