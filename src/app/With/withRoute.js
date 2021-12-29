module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const withController = require('./withController');

  //Hot Talk 조회
  app.get('/with/hot-talk', withController.getHotTalk);

  //카테고리 별 WITH 페이지 개수 조회 API
  app.get('/with/page', withController.getTotalWithPage);

  //카테고리 별 WITH 조회 API
  app.get('/with', withController.getWith);
}