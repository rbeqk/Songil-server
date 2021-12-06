module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const artistAskController = require('./artistAskController');

  //1:1 문의하기 목록 페이지 조회 API
  app.get('/artist-page/ask/page', jwtMiddleware, artistAskController.getAskTotalPage);

  //1:1 문의 목록 조회 API
  app.get('/artist-page/ask', jwtMiddleware, artistAskController.getAsk);

  //1:1 문의 내역 상세 조회 API
  app.get('/artist-page/ask/:askIdx', jwtMiddleware, artistAskController.getAskDetail);

  //1:1 문의 답변 등록 API
  app.post('/artist-page/ask/:askIdx', jwtMiddleware, artistAskController.createAskComment);
}