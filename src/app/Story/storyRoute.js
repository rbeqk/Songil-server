module.exports = function(app){
  const storyController = require("./storyController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");
  const {storyUpload} = require('../../../config/multer');

  //스토리 상세 조회 API
  app.get('/with/stories/:storyIdx', storyController.getStoryDetail);

  //스토리 등록 API
  app.post('/with/stories', jwtMiddleware, storyUpload.array('image'), storyController.createStory);
}