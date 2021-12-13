module.exports = function(app){
  const storyController = require("./storyController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //스토리 상세 조회 API
  app.get('/with/stories/:storyIdx', storyController.getStoryDetail);
}