const qnaProvider = require('./qnaProvider');
const qnaService = require('./qnaService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 5.6
  API Name: QnA 상세 조회 API
  [GET] /with/qna/:qanIdx
*/
exports.getQnADetail = async (req, res) => {
  const {qnaIdx} = req.params;
  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getQnADetail = await qnaProvider.getQnADetail(qnaIdx, userIdx);

  return res.send(getQnADetail);
}

/*
  API No. 5.11
  API Name: QnA 등록 API
  [POST] /with/qna
*/
exports.createQnA = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {title, content} = req.body;

  if (!(title && content)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (title.length > 300) return res.send(errResponse(baseResponse.EXCEED_QNA_TITLE));
  if (content.length > 3000) return res.send(errResponse(baseResponse.EXCEED_QNA_CONTENT));

  const createQnA = await qnaService.createQnA(userIdx, title, content);

  return res.send(createQnA);
}

/*
  API No. 5.11
  API Name: QnA 등록 API
  [POST] /with/qna/:qnaIdx
*/
exports.deleteQnA = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {qnaIdx} = req.params;

  const deleteQnA = await qnaService.deleteQnA(userIdx, qnaIdx);

  return res.send(deleteQnA);
}

/*
  API No. 5.19
  API Name: QnA 수정 API
  [POST] /with/qna/:qnaIdx
*/
exports.updateQnA = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {qnaIdx} = req.params;
  const {title, content} = req.body;

  if (!(title || content)) return res.send(errResponse(baseResponse.UPDATE_INFO_EMPTY));

  if (title && title.length > 300) return res.send(errResponse(baseResponse.EXCEED_QNA_TITLE));
  if (content && content.length > 3000) return res.send(errResponse(baseResponse.EXCEED_QNA_CONTENT));

  const updateQnA = await qnaService.updateQnA(userIdx, qnaIdx, title, content);

  return res.send(updateQnA);
}