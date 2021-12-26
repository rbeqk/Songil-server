module.exports = function(app){
  const storyCommentController = require("./storyCommentController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //스토리 댓글 페이지 개수 조회 API
  app.get('/with/stories/:storyIdx/comments/page', storyCommentController.getStoryCommentTotalPage);

  //스토리 댓글 등록 API
  app.post('/with/stories/:storyIdx/comments', jwtMiddleware, storyCommentController.createStoryComment);

  //스토리 댓글 삭제 API
  app.delete('/with/stories/comments/:commentIdx', jwtMiddleware, storyCommentController.deleteStoryComment);
}