module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const productController = require('./productController');

  app.get('/shop/products/:productIdx', productController.getProductDetail);
}