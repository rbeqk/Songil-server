module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const likeController = require('./likeController');

  //상품 좋아요 변경 API
  app.patch('/shop/products/:productIdx/like', jwtMiddleware, likeController.changeCraftLikeStatus);
}