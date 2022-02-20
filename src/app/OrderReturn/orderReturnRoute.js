module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const orderReturnController = require('./orderReturnController');

  //반품 요청 API
  app.post('/my-page/orders/:orderDetailIdx/return', jwtMiddleware, orderReturnController.reqOrderCraftReturn);
}