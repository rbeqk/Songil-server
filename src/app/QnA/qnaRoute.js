module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const qnaController = require('./qnaController');

  //qna 상세 조회 API
  app.get('/with/qna/:qnaIdx', qnaController.getQnADetail);

  //QnA 등록 API
  app.post('/with/qna', jwtMiddleware, qnaController.createQnA);

  //QnA 삭제 API
  app.delete('/with/qna/:qnaIdx', jwtMiddleware, qnaController.deleteQnA);

  //QnA 수정 API
  app.patch('/with/qna/:qnaIdx', jwtMiddleware, qnaController.updateQnA);

  //QnA 신고 API
  app.post('/with/qna/:qnaIdx/reported', jwtMiddleware, qnaController.reportQnA);
}