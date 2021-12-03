module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const productController = require('./productController');

  //상품 상세 조회 API
  app.get('/shop/crafts/:craftIdx', productController.getCraftDetail);
}