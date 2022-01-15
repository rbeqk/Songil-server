module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const benefitController = require('./benefitController');

  //보유 베네핏 조회 API
  app.get('/my-page/benefits', jwtMiddleware, benefitController.getBenefits);
}