module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const productController = require('./productController');

  app.get('/shop/products/:productIdx', productController.getProductDetail);
  
  app.post('/shop/products/:productIdx/ask', jwtMiddleware, productController.createProductAsk);
}