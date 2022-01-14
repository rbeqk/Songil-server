module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const cartController = require('./cartController');

  //장바구니 상품 추가 API
  app.post('/cart/crafts/:craftIdx', jwtMiddleware, cartController.addCartCraft);

  //장바구니 조회 API
  app.get('/cart', jwtMiddleware, cartController.getCart);
}