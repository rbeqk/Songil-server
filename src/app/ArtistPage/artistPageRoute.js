module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const artistPageController = require('./artistPageController');

  //주문현황 조회 및 반품/취소 요청 현황 조회 API
  app.get('/artist-page/orders', jwtMiddleware, artistPageController.getOrderList);

  //주문현황 조회 및 반품/취소 요청 현황 페이지 조회 API
  app.get('/artist-page/orders/page', jwtMiddleware, artistPageController.getOrderListPage);
  
  //주문자 정보 확인 API
  app.get('/artist-page/orders/:orderDetailIdx', jwtMiddleware, artistPageController.getOrderCraftUserInfo);
}