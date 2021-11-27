module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const shopController = require('./shopController');
  
  app.get('/shop/today-craft/page', shopController.getTodayCraftTotalPage);
  app.get('/shop/today-craft', shopController.getTodayCraft);
  app.get('/shop', shopController.getShopEtc);

  app.get('/search/keywords', shopController.getSearchKeywords);
  app.delete('/search/:searchIdx', jwtMiddleware, shopController.deleteUserRecentlySearch);
}