const askService = require('./askService');
const askProvider = require('./askProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 3.14
  API Name: 1:1 문의하기 작성 (사용자) API
  [POST] /shop/crafts/:craftIdx/ask
*/
exports.createCraftAsk = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {content} = req.body;
  const {craftIdx} = req.params;

  if (!content) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (content.length > 300) return res.send(errResponse(baseResponse.EXCEED_ASK_CONTENT));

  const createCraftAsk = await askService.createCraftAsk(userIdx, craftIdx, content);

  return res.send(createCraftAsk);
}

/*
  API No. 8.2
  API Name: 1:1 문의 내역 페이지 조회 API
  [GET] /mypage/ask/page
*/
exports.getAskTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getAskTotalPage = await askProvider.getAskTotalPage(userIdx);

  return res.send(getAskTotalPage);
}

/*
  API No. 8.1
  API Name: 1:1 문의 내역 페이지 조회 API
  [GET] /mypage/ask
  query: page
*/
exports.getAsk = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;

  const getAsk = await askProvider.getAsk(userIdx, page);

  return res.send(getAsk);
}