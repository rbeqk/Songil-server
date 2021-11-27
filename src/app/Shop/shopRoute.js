module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const shopController = require('./shopController');
  
  //shop 쪽 today craft 페이지 개수 조회 API
  app.get('/shop/today-craft/page', shopController.getTodayCraftTotalPage);

  //shop 쪽 today craft 조회 API
  app.get('/shop/today-craft', shopController.getTodayCraft);

  //shop 쪽 banner/artist/new 조회 API
  app.get('/shop', shopController.getShopEtc);

  //최근 검색어 및 인기 검색어 조회 API
  app.get('/search/keywords', shopController.getSearchKeywords);

  //사용자 최근 검색어 삭제 API
  app.delete('/search/:searchIdx', jwtMiddleware, shopController.deleteUserRecentlySearch);

  //사용자 최근 검색어 전체 삭제 API
  app.delete('/search', jwtMiddleware, shopController.deleteAllUserRecentlySearch);
}