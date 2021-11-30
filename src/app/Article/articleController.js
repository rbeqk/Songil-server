const articleService = require('./articleService');
const articleProvider = require('./articleProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 4.1
  API Name: 아티클 목록 조회 API
  [GET] /articles
*/
exports.getArticleList = async (req, res) => {
  const maxLength = 15; //최대 가지고 올 아티클 개수

  let params = [maxLength];
  const getArticleList = await articleProvider.getArticleList(params);

  return res.send(getArticleList);
}