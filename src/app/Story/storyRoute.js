module.exports = function(app){
  const storyController = require("./storyController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //스토리 상세 조회 API
  app.get('/with/stories/:storyIdx', storyController.getStoryDetail);

  //스토리 좋아요 여부 변경 API
  app.get('/with/stories/:storyIdx/like', jwtMiddleware, storyController.changeUserStoryLikeStatus);
}