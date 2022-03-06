const searchProvider = require("./searchProvider");
const searchService = require("./searchService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 3.10
  API Name: 최근 검색어 및 인기 검색어 조회 API
  [GET] /search/keywords
*/
exports.getSearchKeywords = async (req, res) => {
  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getSearchKeywords = await searchProvider.getSearchKeywords(userIdx);

  return res.send(getSearchKeywords);
}

/*
  API No. 3.16
  API Name: 사용자 최근 검색어 삭제 API
  [DELETE] /search
  query: word
*/
exports.deleteUserRecentlySearch = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {word} = req.query;

  if (!word) return res.send(errResponse(baseResponse.IS_EMPTY));

  const deleteUserRecentlySearch = await searchService.deleteUserRecentlySearch(userIdx, word);

  return res.send(deleteUserRecentlySearch);
}

/*
  API No. 3.16
  API Name: 사용자 최근 검색어 전체 삭제 API
  [DELETE] /search/all
*/
exports.deleteAllUserRecentlySearch = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const deleteAllUserRecentlySearch = await searchService.deleteAllUserRecentlySearch(userIdx);

  return res.send(deleteAllUserRecentlySearch);
}

/*
  API No. 3.6
  API Name: 검색 페이지 개수 조회 API
  [GET] /search/page
  query: keyword, category
*/
exports.getSearchPage = async (req, res) => {
  const {keyword, category} = req.query;

  if (!(keyword && category)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['shop', 'with', 'article'].includes(category)) return res.send(errResponse(baseResponse.INVALID_CATEGORY_NAME));

  const getSearchPage = await searchProvider.getSearchPage(keyword, category);
  return res.send(getSearchPage);
}

/*
  API No. 3.5
  API Name: 검색 API
  [GET] /search
  query: keyword, category, sort, page
*/
exports.getSearch = async (req ,res) => {
  let {keyword} = req.query;
  const {category, sort, page} = req.query;
  const token = req.headers['x-access-token'];
  const clientIp = req.clientIp;

  if (!(keyword && category && sort && page)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['shop', 'with', 'article'].includes(category)) return res.send(errResponse(baseResponse.INVALID_CATEGORY_NAME));
  if (['with', 'article'].includes(category)){
    if (!['popular', 'new'].includes(sort)) return res.send(errResponse(baseResponse.INVALID_SORT_NAME));
  }
  else if (category === 'shop'){
    if (!['popular', 'new', 'comment', 'price'].includes(sort)) return res.send(errResponse(baseResponse.INVALID_SORT_NAME));
  }
  if (page < 1) return res.send(baseResponse.INVALID_PAGE);

  keyword = keyword.trim();
  
  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getSearch = await searchProvider.getSearch(userIdx, keyword, category, sort, page, clientIp);

  return res.send(getSearch);
}