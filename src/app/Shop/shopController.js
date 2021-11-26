const shopProvider = require("../../app/Shop/shopProvider");
const shopService = require("../../app/Shop/shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.3
  API Name: shop 쪽 today craft 페이지 개수 조회 API
  [GET] /shop/today-craft/page
*/
exports.getTodayCraftTotalPage = async (req, res) => {
  //현재는 상품 전체 개수의 페이지와 동일
  const getTodayCraftTotalPage = await shopProvider.getTodayCraftTotalPage();

  return res.send(getTodayCraftTotalPage);
}

/*
  API No. 3.2
  API Name: shop 쪽 today craft 조회 API
  [GET] /shop/today-craft
  query: page
*/
exports.getTodayCraft = async (req, res) => {
  const {page} = req.query;
  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  let params = [page];

  const getTodayCraft = await shopProvider.getTodayCraft(params);

  return res.send(getTodayCraft);
}

/*
  API No. 3.1
  API Name: shop 쪽 banner/artist/new 조회 API
  [GET] /shop
*/
exports.getShopEtc = async (req, res) => {
  const getShopEtc = await shopProvider.getShopEtc();

  return res.send(getShopEtc);
}

/*
  API No. 3.10
  API Name: 최근 검색어 및 인기 검색어 조회 API
  [GET] /search/keywords
*/
exports.getSearchKeywords = async (req, res) => {
  const token = req.headers['x-access-token'];

  let params = [token];

  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  params = [userIdx];

  const getSearchKeywords = await shopProvider.getSearchKeywords(params);

  return res.send(getSearchKeywords);
}

/*
  API No. 3.16
  API Name: 사용자 최근 검색어 삭제 API
  [DELETE] /search/:userSearchIdx
*/
exports.deleteUserRecentlySearch = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {userSearchIdx} = req.params;

  let params = [userIdx, userSearchIdx];
  const deleteUserRecentlySearch = await shopService.deleteUserRecentlySearch(params);

  return res.send(deleteUserRecentlySearch);
}