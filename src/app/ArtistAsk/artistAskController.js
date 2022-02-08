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
  API Name: 1:1 문의 내역 조회 API
  [GET] /artist-page/ask
  query: page
*/
exports.getAsk = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;
  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const getAsk = await artistAskProvider.getAsk(userIdx, page);

  return res.send(getAsk);
}

/*
  API No. 10.4
  API Name: 1:1 문의 내역 상세 조회 API
  [GET] /artist-page/ask/:askIdx
*/
exports.getAskDetail = async (req, res) => {
  const {askIdx} = req.params;
  const {userIdx} = req.verifiedToken;

  const getAskDetail = await artistAskProvider.getAskDetail(askIdx, userIdx);

  return res.send(getAskDetail);
}

/*
  API No. 10.5
  API Name: 1:1 문의 답변 등록 API
  [POST] /artist-page/ask/:askIdx
  body: comment
*/
exports.createAskComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {askIdx: craftAskIdx} = req.params;
  const {comment} = req.body;

  if (!comment) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (comment.length > 300) return res.send(errResponse(baseResponse.EXCEED_CRAFT_ASK_COMMENT_REASON));

  const createAskComment = await artistAskService.createAskComment(userIdx, craftAskIdx, comment);

  return res.send(createAskComment);
}