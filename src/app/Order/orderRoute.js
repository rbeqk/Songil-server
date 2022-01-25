module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const orderController = require('./orderController');

  //주문서 상품 추가 API
  app.post('/order/crafts', jwtMiddleware, orderController.addCraftInOrderSheet);

  //베네핏 적용 API
  app.post('/order/:orderIdx/benefits', jwtMiddleware, orderController.applyOrderBenefit);

  //추가 배송비 적용 및 조회 API
  app.post('/order/:orderIdx/extra-fee', jwtMiddleware, orderController.updateOrderExtraShippingFee);

  //결제 검증 API
  app.post('/order/:orderIdx', jwtMiddleware, orderController.validatePayment);
}