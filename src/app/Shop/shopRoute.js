module.exports = function(app){
  const shopController = require('./shopController');

  app.get('/shop/products/:productIdx', shopController.getProductDetail);
}