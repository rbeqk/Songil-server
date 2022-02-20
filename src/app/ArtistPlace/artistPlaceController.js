const artistPlaceProvider = require('./artistPlaceProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 9.1
  API Name: 작가 정보 조회 API
  [GET] /artist/:artistIdx
*/
exports.getArtistInfo = async (req, res) => {
  const {artistIdx} = req.params;

  const getArtistInfo = await artistPlaceProvider.getArtistInfo(artistIdx);
  return res.send(getArtistInfo);
}

/*
  API No. 9.2
  API Name: 작가 별 craft 페이지 개수 조회 API
  [GET] /artist/:artistIdx/crafts/page
*/
exports.getArtistCraftTotalPage = async (req, res) => {
  const {artistIdx} = req.params;

  const getArtistCraftTotalPage = await artistPlaceProvider.getArtistCraftTotalPage(artistIdx);
  return res.send(getArtistCraftTotalPage);
}

/*
  API No. 9.3
  API Name: 작가 별 craft 조회 API
  [GET] /artist/:artistIdx/crafts
  query: page, sort
*/
exports.getArtistCraft = async (req, res) => {
  const {artistIdx} = req.params;
  const {page, sort} = req.query;

  if (!(page && sort)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['popular', 'new', 'comment', 'price'].includes(sort)) return res.send(errResponse(baseResponse.INVALID_SORT_NAME));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getArtistCraft = await artistPlaceProvider.getArtistCraft(artistIdx, page, sort, userIdx);

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

  const getArtistArticleTotalPage = await artistPlaceProvider.getArtistArticleTotalPage(artistIdx);

  return res.send(getArtistArticleTotalPage);
}

/*
  API No. 9.5
  API Name: 작가 별 article 조회 API
  [GET] /artist/:artistIdx/articles
  query: page, sort
*/
exports.getArtistArticle = async (req, res) => {
  const {page, sort} = req.query;
  if (!(page && sort)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['popular', 'new'].includes(sort)) return res.send(errResponse(baseResponse.INVALID_SORT_NAME));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const {artistIdx} = req.params;

  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getArtistArticle = await artistPlaceProvider.getArtistArticle(artistIdx, page, sort, userIdx);

  return res.send(getArtistArticle);
}