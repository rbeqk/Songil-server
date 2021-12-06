module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const searchController = require('./searchController');

  //최근 검색어 및 인기 검색어 조회 API
  app.get('/search/keywords', searchController.getSearchKeywords);

  //사용자 최근 검색어 삭제 API
  app.delete('/search/:searchIdx', jwtMiddleware, searchController.deleteUserRecentlySearch);

  //사용자 최근 검색어 전체 삭제 API
  app.delete('/search', jwtMiddleware, searchController.deleteAllUserRecentlySearch);
}