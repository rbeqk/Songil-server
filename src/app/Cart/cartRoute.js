module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const cartController = require('./cartController');

  //장바구니 상품 추가 API
  app.post('/cart/crafts/:craftIdx', jwtMiddleware, cartController.addCartCraft);

  //장바구니 개수 조회 API
  app.get('/cart/conut', jwtMiddleware, cartController.getCartCnt);

  //장바구니 조회 API
  app.get('/cart', jwtMiddleware, cartController.getCart);

  //장바구니 상품 삭제 API
  app.delete('/cart/crafts/:craftIdx', jwtMiddleware, cartController.deleteCartCraft);

  //장바구니 상품 수정 API
  app.patch('/cart/crafts/:craftIdx', jwtMiddleware, cartController.updateCartCraft);
}