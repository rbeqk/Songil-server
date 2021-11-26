module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const shopController = require('./shopController');
  
  app.get('/shop/today-craft/page', shopController.getTodayCraftTotalPage);
}