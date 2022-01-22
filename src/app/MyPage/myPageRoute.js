module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const myPageController = require('./myPageController');
  const {userProfileUpload} = require('../../../config/multer');

  //내 코멘트 조회 API
  app.get('/my-page/crafts/comments', jwtMiddleware, myPageController.getMyComment);

  //내가 쓴 글 조회 API
  app.get('/my-page/with', jwtMiddleware, myPageController.getUserWrittenWith);

  //댓글 단 글 조회 API
  app.get('/my-page/with/comments', jwtMiddleware, myPageController.getUserWrittenWithComment);

  //프로필 수정 API
  app.patch('/my-page/profile', jwtMiddleware, userProfileUpload.single('userProfile'), myPageController.updateUserProfile);
}