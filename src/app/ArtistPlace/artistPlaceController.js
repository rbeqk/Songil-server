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

/*
  API No. 9.2
  API Name: 작가 별 craft 페이지 개수 조회 API
  [GET] /artist/:artistIdx/crafts/page
*/
exports.getArtistCraftTotalPage = async (req, res) => {
  const {artistIdx} = req.params;
  let params = [artistIdx];
  const getArtistCraftTotalPage = await artistPlaceProvider.getArtistCraftTotalPage(params);

  return res.send(getArtistCraftTotalPage);
}

/*
  API No. 9.3
  API Name: 작가 별 craft 조회 API
  [GET] /artist/:artistIdx/crafts
  query: page, filter
*/
exports.getArtistCraft = async (req, res) => {
  const {artistIdx} = req.params;
  const {page, filter} = req.query;

  if (!(page && filter)) return res.send(errResponse(baseResponse.IS_EMPTY));

  const token = req.headers['x-access-token'];

  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  const getArtistCraft = await artistPlaceProvider.getArtistCraft(artistIdx, page, filter, userIdx);

  return res.send(getArtistCraft);
}

/*
  API No. 9.4
  API Name: 작가 별 article 페이지 개수 조회 API
  [GET] /artist/:artistIdx/articles/page

  작가의 상품이 들어있거나 태그가 작가명일 때
*/
exports.getArtistArticleTotalPage = async (req, res) => {
  const {artistIdx} = req.params;

  const getArtistArticleTotalPage = await artistPlaceProvider.getArtistCraftTotalPage(artistIdx);

  return res.send(getArtistArticleTotalPage);
}

/*
  API No. 9.5
  API Name: 작가 별 article 조회 API
  [GET] /artist/:artistIdx/articles
  query: page, filter
*/
exports.getArtistArticle = async (req, res) => {
  const {page, filter} = req.query;
  if (!(page && filter)) return res.send(errResponse(baseResponse.IS_EMPTY));

  const {artistIdx} = req.params;

  const token = req.headers['x-access-token'];
  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  const getArtistArticle = await artistPlaceProvider.getArtistArticle(artistIdx, page, filter, userIdx);

  return res.send(getArtistArticle);
}