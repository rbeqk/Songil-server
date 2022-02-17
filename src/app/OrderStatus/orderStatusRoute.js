module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const orderStatusController = require('./orderStatusController');

  //결제 정보 조회 API
  app.get('/my-page/orders/:orderDetailIdx', jwtMiddleware, orderStatusController.getOrderDetail);

  //주문 현황 조회 API
  app.get('/my-page/orders', jwtMiddleware, orderStatusController.getOrderList);
}