module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const shopController = require('./shopController');
  
  //shop 쪽 today craft 페이지 개수 조회 API
  app.get('/shop/today-craft/page', shopController.getTodayCraftTotalPage);

  //shop 쪽 today craft 조회 API
  app.get('/shop/today-craft', shopController.getTodayCraft);

  //shop 쪽 banner/artist/new 조회 API
  app.get('/shop', shopController.getShopEtc);

  //카테고리 별 전체 상품 페이지 개수 조회 API
  app.get('/shop/craft/page', shopController.getProductByCategoryTotalPage);
}