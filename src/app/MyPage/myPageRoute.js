module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const myPageController = require('./myPageController');

  //내 코멘트 조회 API
  app.get('/my-page/crafts/comments', jwtMiddleware, myPageController.getMyComment);

  //내가 쓴 글 조회 API
  app.get('/my-page/with', jwtMiddleware, myPageController.getUserWrittenWith);

  //댓글 단 글 조회 API
  app.get('/my-page/with/comments', jwtMiddleware, myPageController.getUserWrittenWithComment);
}