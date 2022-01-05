const qnaCommentProvider = require("./qnaCommentProvider");
const qnaCommentService = require("./qnaCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 5.14
  API Name: QnA 댓글 등록 API
  [POST] /with/qna/:qnaIdx/comments
  body: parentIdx, comment
*/
exports.createQnAComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {qnaIdx} = req.params;
  const {parentIdx, comment} = req.body;

  if (!comment) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (comment.length > 500) return res.send(errResponse(baseResponse.EXCEED_QNA_COMMENT));

  const createQnAComment = await qnaCommentService.createQnAComment(userIdx, qnaIdx, parentIdx, comment);

  return res.send(createQnAComment);
}

/*
  API No. 5.24
  API Name: QnA 댓글 삭제 API
  [DELETE] /with/qna/comments/:commentIdx
*/
exports.deleteQnAComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {commentIdx: qnaCommentIdx} = req.params;

  const deleteQnAComment = await qnaCommentService.deleteQnAComment(userIdx, qnaCommentIdx);

  return res.send(deleteQnAComment);
}

/*
  API No. 5.14
  API Name: QnA 댓글 조회 API
  [GET] /with/qna/:qnaIdx/comments
  query: page
*/
exports.getQnAComment = async (req, res) => {
  const {qnaIdx} = req.params;
  const {page} = req.query;
  const token = req.headers['x-access-token'];

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getQnAComment = await qnaCommentProvider.getQnAComment(qnaIdx, userIdx, page);

  return res.send(getQnAComment);
}

/*
  API No. 5.21
  API Name: QnA 댓글 신고 API
  [POST] /with/qna/comments/:commentIdx/reported
  body: reportedReasonIdx, etcReason
*/
exports.reportQnAComment = async (req, res) => {
  const {commentIdx: qnaCommentIdx} = req.params;
  const {userIdx} = req.verifiedToken;
  const {reportedReasonIdx: reportedCommentReasonIdx, etcReason} = req.body;

  if (!reportedCommentReasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reportedCommentReasonIdx < 1 || reportedCommentReasonIdx > 7) return res.send(errResponse(baseResponse.INVALID_REPORTED_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reportedCommentReasonIdx == 7 && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reportedCommentReasonIdx != 7 && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > 150) return res.send(errResponse(baseResponse.EXCEED_REPORTED_REASON));

  const reportQnAComment = await qnaCommentService.reportQnAComment(qnaCommentIdx, userIdx, reportedCommentReasonIdx, etcReason);
  return res.send(reportQnAComment);
}