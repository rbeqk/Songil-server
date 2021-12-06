module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const craftCommentController = require('./craftCommentController');
  
  //상품 댓글 페이지 개수 조회 API
  app.get('/shop/crafts/:craftIdx/comments/page', craftCommentController.getCommentTotalPage);

  //상품 댓글 조회 API
  app.get('/shop/crafts/:craftIdx/comments', craftCommentController.getComment);

  //상품 댓글 신고 API
  app.post('/comments/:commentIdx/reported', jwtMiddleware, craftCommentController.reportComment);
}