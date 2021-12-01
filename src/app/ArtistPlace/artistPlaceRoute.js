module.exports = function (app){
  const artistPlaceController = require('./artistPlaceController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');

  //작가 정보 조회 API
  app.get('/artists/:artistIdx', artistPlaceController.getArtistInfo);

  //작가 별 craft 페이지 개수 조회 API
  app.get('/artist/:artistIdx/crafts/page', artistPlaceController.getArtistCraftTotalPage);

  //작가 별 craft 조회 API
  app.get('/artist/:artistIdx/crafts', artistPlaceController.getArtistCraft);
}