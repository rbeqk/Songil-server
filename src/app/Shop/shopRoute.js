module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const shopController = require('./shopController');

  app.get('/shop/products/:productIdx', shopController.getProductDetail);
  
  app.post('/shop/products/:productIdx/ask', jwtMiddleware, shopController.createProductAsk);
}