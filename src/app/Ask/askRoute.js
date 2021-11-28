module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const askController = require('./askController');

  //1:1 문의하기 작성 (사용자) API
  app.post('/shop/products/:productIdx/ask', jwtMiddleware, askController.createProductAsk);

  //1:1 문의 내역 페이지 조회 API
  app.get('/mypage/ask/page', jwtMiddleware, askController.getAskTotalPage);

  //1:1 문의 내역 조회 API
  app.get('/mypage/ask', jwtMiddleware, askController.getAsk);
}