module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const abTestController = require('./abTestController');
  const {ABTestUpload} = require('../../../config/multer');

  //ABTest 상세 조회 API
  app.get('/with/ab-test/:abTestIdx', abTestController.getABTestDetail);

  //AB테스트 등록 API
  app.post('/with/ab-test', jwtMiddleware, ABTestUpload.array('image'), abTestController.createABTest);
}