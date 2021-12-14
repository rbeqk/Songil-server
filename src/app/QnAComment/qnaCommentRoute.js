module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const qnaCommentController = require('./qnaCommentController');

  //QnA 댓글 등록
  app.post('/with/qna/:qnaIdx/comments', jwtMiddleware, qnaCommentController.createQnAComment);
}