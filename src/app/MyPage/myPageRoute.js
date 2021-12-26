module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const myPageController = require('./myPageController');

  //내 코멘트 페이지 개수 조회 API
  app.get('/my-page/comments/page', jwtMiddleware, myPageController.getMyCommentTotalPage);
}