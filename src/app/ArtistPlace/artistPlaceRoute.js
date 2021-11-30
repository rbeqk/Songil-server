module.exports = function (app){
  const artistPlaceController = require('./artistPlaceController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');

  //작가 정보 조회 API
  app.get('/artists/:artistIdx', artistPlaceController.getArtistInfo);
}