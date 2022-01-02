module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const abTestCommentController = require('./abTestCommentController');

  //AB Test 댓글 등록 API
  app.post('/with/ab-test/:abTestIdx/comments', jwtMiddleware, abTestCommentController.createABTestComment);

  //AB Test 댓글 삭제 API
  app.delete('/with/ab-test/ocomments/:commentIdx', jwtMiddleware, abTestCommentController.deleteABTestComment);

  //AB Test 댓글 조회 API
  app.get('/with/ab-test/:abTestIdx/comments', abTestCommentController.getABTestComment);
}