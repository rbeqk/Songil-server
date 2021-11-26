module.exports = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const likeController = require('./likeController');

  app.post('/shop/products/:productIdx/like', jwtMiddleware, likeController.changeLikeStatus);
}