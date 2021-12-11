module.exports = function(app){
  const storyCommentController = require("./storyCommentController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //스토리 댓글 페이지 개수 조회 API
  app.get('/with/stories/:storyIdx/comments/page', storyCommentController.getStoryCommentTotalPage);
}