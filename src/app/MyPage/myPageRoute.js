module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const myPageController = require('./myPageController');

  //내 코멘트 페이지 개수 조회 API
  app.get('/my-page/crafts/comments/page', jwtMiddleware, myPageController.getMyCommentTotalPage);

  //내 코멘트 조회 API
  app.get('/my-page/crafts/comments', jwtMiddleware, myPageController.getMyComment);

  //좋아요한 게시글 페이지 개수 조회 API
  app.get('/my-page/with/liked/page', jwtMiddleware, myPageController.getLikePostCnt);

  //좋아요한 게시글 조회 API
  app.get('/my-page/with/liked', jwtMiddleware, myPageController.getLikedPost);
}