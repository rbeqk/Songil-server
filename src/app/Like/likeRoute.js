module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const likeController = require('./likeController');

  //상품 좋아요 변경 API
  app.patch('/shop/crafts/:craftIdx/like', jwtMiddleware, likeController.changeCraftLikeStatus);

  //아티클 좋아요 변경 API
  app.patch('/articles/:articleIdx/like', jwtMiddleware, likeController.changeArticleLikeStatus);

  //좋아요한 아티클 조회 API
  app.get('/my-page/articles/liked', jwtMiddleware, likeController.getLikedArticle);

  //찜한 상품 조회 API
  app.get('/my-page/crafts/liked', jwtMiddleware, likeController.getLikedCraft);

  //QnA 좋아요 여부 변경 API
  app.patch('/with/qna/:qnaIdx/like', jwtMiddleware, likeController.changeQnALikeStatus);

  //스토리 좋아요 여부 변경 API
  app.patch('/with/stories/:storyIdx/like', jwtMiddleware, likeController.changeUserStoryLikeStatus);

  //좋아요한 게시글 조회 API
  app.get('/my-page/with/liked', jwtMiddleware, likeController.getLikedPost);
}