module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const likeController = require('./likeController');

  //상품 좋아요 변경 API
  app.patch('/shop/products/:productIdx/like', jwtMiddleware, likeController.changeCraftLikeStatus);

  //아티클 좋아요 변경 API
  app.patch('/articles/:articleIdx/like', jwtMiddleware, likeController.changeArticleLikeStatus);

  //좋아요한 아티클 페이지 개수 조회 API
  app.get('/my-page/articles/liked/page', jwtMiddleware, likeController.getLikedArticleTotalPage);

  //좋아요한 아티클 조회 API
  app.get('/my-page/articles/liked', jwtMiddleware, likeController.getLikedArticle);
}