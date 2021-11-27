module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const askController = require('./askController');

  app.post('/shop/products/:productIdx/ask', jwtMiddleware, askController.createProductAsk);
  app.get('/mypage/ask/page', jwtMiddleware, askController.getAskTotalPage);
}