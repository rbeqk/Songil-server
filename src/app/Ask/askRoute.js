module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const askController = require('./askController');

  app.get('/mypage/ask/page', jwtMiddleware, askController.getAskTotalPage);
}