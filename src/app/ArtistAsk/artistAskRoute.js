module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const artistAskController = require('./artistAskController');

  //1:1 문의하기 목록 페이지 조회 API
  app.get('/artist-page/ask/page', jwtMiddleware, artistAskController.getAskTotalPage);

  //1:1 문의 목록 조회 API
  app.get('/artist-page/ask', jwtMiddleware, artistAskController.getAsk);
}