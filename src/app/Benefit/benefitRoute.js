module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const benefitController = require('./benefitController');

  //보유 베네핏 조회 API
  app.get('/my-page/benefits', jwtMiddleware, benefitController.getBenefits);

  //주문 시 적용 가능 베네핏 조회 API
  app.get('/orders/:orderIdx/benefits', jwtMiddleware, benefitController.getCanUseBenefit);
}