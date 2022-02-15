module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const deliveryController = require('./deliveryController');

  //발송정보 입력 API
  app.post('/artist-page/ordrers/:orderDetailIdx/sending', jwtMiddleware, deliveryController.createSendingInfo);

  //발송정보  조회 API
  app.get('/artist-page/ordrers/:orderDetailIdx/sending', jwtMiddleware, deliveryController.getSendingInfo);

  //배송 현황 조회 API
  app.get('/my-page/orders/:orderDetailIdx/delivery', jwtMiddleware, deliveryController.getDeliveryInfo);
}