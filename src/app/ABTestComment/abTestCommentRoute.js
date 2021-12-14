module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const abTestCommentController = require('./abTestCommentController');

  //AB Test 댓글 등록 API
  app.post('/with/ab-test/:abTestIdx/comments', jwtMiddleware, abTestCommentController.createABTestComment);
}