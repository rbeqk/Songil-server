module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const artistPageController = require('./artistPageController');

  //주문자 정보 확인 API
  app.get('/artist-page/orders/:orderDetailIdx', jwtMiddleware, artistPageController.getOrderCraftUserInfo);
}