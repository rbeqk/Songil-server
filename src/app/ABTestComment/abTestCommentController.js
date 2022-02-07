const abTestCommentProvider = require("./abTestCommentProvider");
const abTestCommentService = require("./abTestCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 5.15
  API Name: AB Test 댓글 등록 API
  [POST] /with/ab-test/:abTestIdx/comments
*/
exports.createABTestComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {abTestIdx} = req.params;
  const {parentIdx, comment} = req.body;

  if (!comment) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (comment.length > 500) return res.send(errResponse(baseResponse.EXCEED_ABTEST_COMMENT));

  const createABTestComment = await abTestCommentService.createABTestComment(userIdx, abTestIdx, parentIdx, comment);

  return res.send(createABTestComment);
}

/*
  API No. 5.25
  API Name: AB Test 댓글 삭제 API
  [DELETE] /with/ab-test/ocomments/:commentIdx
*/
exports.deleteABTestComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {commentIdx: abTestCommentIdx} = req.params;
  
  const deleteABTestComment = await abTestCommentService.deleteABTestComment(userIdx, abTestCommentIdx);

  return res.send(deleteABTestComment);
}

/*
  API No. 5.23
  API Name: AB Test 댓글 조회 API
  [GET] /with/ab-test/:abTestIdx/comments
  query: page
*/
exports.getABTestComment = async (req, res) => {
  const {abTestIdx} = req.params;
  const {page} = req.query;
  const token = req.headers['x-access-token'];

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getABTestComment = await abTestCommentProvider.getABTestComment(abTestIdx, userIdx, page);

  return res.send(getABTestComment);
}

/*
  API No. 5.31
  API Name: AB Test 댓글 신고 API
  [POST] /with/ab-test/comments/:commentIdx/reported
  body: reportedReasonIdx, etcReason
*/
exports.reportABTestComment = async (req, res) => {
  const {commentIdx: abTestCommentIdx} = req.params;
  const {userIdx} = req.verifiedToken;
  const {reportedReasonIdx, etcReason} = req.body;

  if (!reportedReasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reportedReasonIdx < 1 || reportedReasonIdx > 7) return res.send(errResponse(baseResponse.INVALID_REPORTED_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reportedReasonIdx == 7 && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reportedReasonIdx != 7 && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > 150) return res.send(errResponse(baseResponse.EXCEED_REPORTED_REASON));

  const reportABTestComment = await abTestCommentService.reportABTestComment(abTestCommentIdx, userIdx, reportedReasonIdx, etcReason);
  return res.send(reportABTestComment);
}