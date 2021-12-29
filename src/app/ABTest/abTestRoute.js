module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const abTestController = require('./abTestController');
  const {ABTestUpload} = require('../../../config/multer');

  //ABTest 상세 조회 API
  app.get('/with/ab-test/:abTestIdx', abTestController.getABTestDetail);

  //AB테스트 등록 API
  app.post('/with/ab-test', jwtMiddleware, ABTestUpload.array('image'), abTestController.createABTest);

  //ABTest 삭제 API
  app.delete('/with/ab-test/:abTestIdx', jwtMiddleware, abTestController.deleteABTest);

  //ABTest 투표 API
  app.post('/with/ab-test/:abTestIdx/vote', jwtMiddleware, abTestController.voteABTest);

  //ABTest 투표 취소 API
  app.delete('/with/ab-test/:abTestIdx/vote', jwtMiddleware, abTestController.deleteVoteABTest);
}