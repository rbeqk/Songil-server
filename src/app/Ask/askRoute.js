module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const askController = require('./askController');

  //1:1 문의하기 작성 (사용자) API
  app.post('/shop/crafts/:craftIdx/ask', jwtMiddleware, askController.createCraftAsk);

  //문의 내역 조회 API
  app.get('/my-page/ask', jwtMiddleware, askController.getAsk);

  //주문현황 문의하기 작성 API
  app.post('/my-page/orders/:orderDetailIdx/ask', jwtMiddleware, askController.createDeliveryAsk);
}