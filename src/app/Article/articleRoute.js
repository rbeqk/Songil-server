module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const articleController = require('./articleController');

  //아티클 목록 조회 API
  app.get('/articles', articleController.getArticleList);

  //아티클 상세 조회 API
  app.get('/articles/:articleIdx', articleController.getArticleDetail);
}