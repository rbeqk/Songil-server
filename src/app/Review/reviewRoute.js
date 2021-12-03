module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const reviewController = require('./reviewController');
  
  //상품 댓글 페이지 개수 조회 API
  app.get('/shop/crafts/:craftIdx/comments/page', reviewController.getCommentTotalPage);

  //상품 댓글 조회 API
  app.get('/shop/crafts/:craftIdx/comments', reviewController.getComment);

  //상품 댓글 신고 API
  app.post('/comments/:commentIdx/reported', jwtMiddleware, reviewController.reportComment);
}