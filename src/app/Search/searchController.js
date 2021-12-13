const searchProvider = require("./searchProvider");
const searchService = require("./searchService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

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

  const getSearchKeywords = await searchProvider.getSearchKeywords(params);

  return res.send(getSearchKeywords);
}

/*
  API No. 3.16
  API Name: 사용자 최근 검색어 삭제 API
  [DELETE] /search/:searchIdx
*/
exports.deleteUserRecentlySearch = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {searchIdx} = req.params;

  let params = [userIdx, searchIdx];
  const deleteUserRecentlySearch = await searchService.deleteUserRecentlySearch(params);

  return res.send(deleteUserRecentlySearch);
}

/*
  API No. 3.16
  API Name: 사용자 최근 검색어 전체 삭제 API
  [DELETE] /search
*/
exports.deleteAllUserRecentlySearch = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  let params = [userIdx];
  const deleteAllUserRecentlySearch = await searchService.deleteAllUserRecentlySearch(params);

  return res.send(deleteAllUserRecentlySearch);
}