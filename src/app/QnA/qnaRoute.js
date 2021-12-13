module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const qnaController = require('./qnaController');

  //qna 상세 조회 API
  app.get('/with/qna/:qnaIdx', qnaController.getQnADetail);
}