module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const orderController = require('./orderController');

  //주문서 상품 추가 API
  app.post('/order/crafts', jwtMiddleware, orderController.addCraftInOrderSheet);
}