const artistAskService = require('./artistAskService');
const artistAskProvider = require('./artistAskProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 10.2
  API Name: 1:1 문의 내역 페이지 조회 API
  [GET] /artist-page/ask/page
*/
exports.getAskTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getAskTotalPage = await artistAskProvider.getAskTotalPage(userIdx);

  return res.send(getAskTotalPage);
}

/*
  API No. 10.3
  API Name: 1:1 문의 내역 페이지 조회 API
  [GET] /artist-page/ask
  query: page
*/
exports.getAsk = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;
  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));

  const getAsk = await artistAskProvider.getAsk(userIdx, page);

  return res.send(getAsk);
}