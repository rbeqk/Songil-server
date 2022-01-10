module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const shopController = require('./shopController');

  //shop 화면 조회
  app.get('/shop', shopController.getShop);

  //카테고리 별 전체 상품 페이지 개수 조회 API
  app.get('/shop/crafts/page', shopController.getCraftByCategoryTotalPage);

  //카테고리 별 이번주 인기 상품 조회 API
  app.get('/shop/crafts/popular', shopController.getWeeklyPopularCraft);
}