module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const orderCancelController = require('./orderCancelController');

  //주문취소 요청 API
  app.post('/my-page/orders/:orderDetailIdx/cancel', jwtMiddleware, orderCancelController.reqOrderCraftCancel);
}