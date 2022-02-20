const articleProvider = require('./articleProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 4.1
  API Name: 아티클 목록 조회 API
  [GET] /articles
*/
exports.getArticleList = async (req, res) => {
  const getArticleList = await articleProvider.getArticleList();

  return res.send(getArticleList);
}

/*
  API No. 4.2
  API Name: 아티클 상세 조회 API
  [GET] /articles/:articleIdx
*/
exports.getArticleDetail = async (req, res) => {
  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const {articleIdx} = req.params;
  const getArticleDetail = await articleProvider.getArticleDetail(articleIdx, userIdx);

  return res.send(getArticleDetail);
}