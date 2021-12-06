module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const craftController = require('./craftController');

  //상품 상세 조회 API
  app.get('/shop/crafts/:craftIdx', craftController.getCraftDetail);
}