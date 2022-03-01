module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const orderReturnController = require('./orderReturnController');

  //반품 요청 API
  app.post('/my-page/orders/:orderDetailIdx/return', jwtMiddleware, orderReturnController.reqOrderCraftReturn);

  //반품 승인 및 거부 API
  app.post('/artist-page/orders/:orderDetailIdx/return', jwtMiddleware, orderReturnController.resOrderCraftReturn);
}