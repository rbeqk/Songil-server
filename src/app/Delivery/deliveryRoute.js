module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const deliveryController = require('./deliveryController');

  //발송정보 입력 API
  app.post('/artist-page/ordrers/:orderDetailIdx/sending', jwtMiddleware, deliveryController.createDeliveryInfo);
}