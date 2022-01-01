module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const qnaCommentController = require('./qnaCommentController');

  //QnA 댓글 등록
  app.post('/with/qna/:qnaIdx/comments', jwtMiddleware, qnaCommentController.createQnAComment);

  //QnA 댓글 삭제
  app.delete('/with/qna/comments/:commentIdx', jwtMiddleware, qnaCommentController.deleteQnAComment);

  //QnA 댓글 조회 API
  app.get('/with/qna/:qnaIdx/comments', qnaCommentController.getQnAComment);
}