module.exports = function (app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const searchController = require('./searchController');
  const {ipMiddleware} = require('../../../config/ipMiddleware');

  //최근 검색어 및 인기 검색어 조회 API
  app.get('/search/keywords', searchController.getSearchKeywords);

  //사용자 최근 검색어 전체 삭제 API
  app.delete('/search/all', jwtMiddleware, searchController.deleteAllUserRecentlySearch);

  //사용자 최근 검색어 삭제 API
  app.delete('/search', jwtMiddleware, searchController.deleteUserRecentlySearch);

  //검색 페이지 개수 조회 API
  app.get('/search/page', searchController.getSearchPage);

  //검색 API
  app.get('/search', ipMiddleware, searchController.getSearch);
}