module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const reviewController = require('./reviewController');
  
  app.get('/shop/products/:productIdx/reviews/page', reviewController.getReviewTotalPage);
  app.get('/shop/products/:productIdx/reviews', reviewController.getReview);
}