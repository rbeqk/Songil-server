const articleService = require('./articleService');
const articleProvider = require('./articleProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

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

  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  const {articleIdx} = req.params;
  const getArticleDetail = await articleProvider.getArticleDetail(articleIdx, userIdx);

  return res.send(getArticleDetail);
}