module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const abTestController = require('./abTestController');

  //ABTest 상세 조회 API
  app.get('/with/ab-test/:abTestIdx', abTestController.getABTestDetail);
}