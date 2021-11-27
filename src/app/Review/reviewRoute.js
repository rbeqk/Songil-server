module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const reviewController = require('./reviewController');
  
  //상품 리뷰 페이지 개수 조회 API
  app.get('/shop/products/:productIdx/reviews/page', reviewController.getReviewTotalPage);

  //상품 리뷰 조회 API
  app.get('/shop/products/:productIdx/reviews', reviewController.getReview);

  //상품 리뷰 신고 API
  app.post('/reported-reviews/:productReviewIdx', jwtMiddleware, reviewController.reportReview);
}