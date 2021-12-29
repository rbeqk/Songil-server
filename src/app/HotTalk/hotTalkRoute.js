module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const hotTalkController = require('./hotTalkController');

  //Hot Talk 조회
  app.get('/with/hot-talk', hotTalkController.getHotTalk);
}