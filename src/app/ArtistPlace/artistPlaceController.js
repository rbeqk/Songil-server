const artistPlaceService = require('./artistPlaceService');
const artistPlaceProvider = require('./artistPlaceProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 9.1
  API Name: 작가 정보 조회 API
  [GET] /artist/:artistIdx
*/
exports.getArtistInfo = async (req, res) => {
  const {artistIdx} = req.params;
  let params = [artistIdx];

  const getArtistInfo = await artistPlaceProvider.getArtistInfo(params);

  return res.send(getArtistInfo);
}