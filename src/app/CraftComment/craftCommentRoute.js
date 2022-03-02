module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const craftCommentController = require('./craftCommentController');
  const {craftCommentUpload} = require('../../../config/multer');
  
  //상품 댓글 페이지 개수 조회 API
  app.get('/shop/crafts/:craftIdx/comments/page', craftCommentController.getCommentTotalPage);

  //상품 댓글 조회 API
  app.get('/shop/crafts/:craftIdx/comments', craftCommentController.getComment);

  //상품 댓글 신고 API
  app.post('/shop/crafts/comments/:commentIdx/reported', jwtMiddleware, craftCommentController.reportComment);

  //상품 댓글 작성 API
  app.post('/my-page/crafts/comments', jwtMiddleware, craftCommentUpload.array('image'), craftCommentController.createCraftComment);

  //상품 댓글 삭제 API
  app.delete('/shop/crafts/comments/:commentIdx', jwtMiddleware, craftCommentController.deleteCraftComment);
}