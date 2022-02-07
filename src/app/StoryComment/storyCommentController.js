const storyCommentProvider = require("./storyCommentProvider");
const storyCommentService = require("./storyCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 5.13
  API Name: 스토리 댓글 등록 API
  [POST] /with/stories/:storyIdx/comments
  body: parentIdx, comment
*/
exports.createStoryComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {storyIdx} = req.params;
  const {parentIdx, comment} = req.body;

  if (!comment) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (comment.length > 500) return res.send(errResponse(baseResponse.EXCEED_STORY_COMMENT));

  const createStoryComment = await storyCommentService.createStoryComment(userIdx, storyIdx, parentIdx, comment);

  return res.send(createStoryComment);
}

/*
  API No. 5.23
  API Name: 스토리 댓글 삭제 API
  [DELETE] /with/stories/comments/:commentIdx
*/
exports.deleteStoryComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {commentIdx: storyCommentIdx} = req.params;

  const deleteStoryComment = await storyCommentService.deleteStoryComment(userIdx, storyCommentIdx);

  return res.send(deleteStoryComment);
}

/*
  API No. 5.5
  API Name: 스토리 댓글 조회 API
  [GET] /with/stories/:storyIdx/comments
  query: page
*/
exports.getStoryComment = async (req, res) => {
  const {storyIdx} = req.params;
  const {page} = req.query;
  const token = req.headers['x-access-token'];

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getStoryComment = await storyCommentProvider.getStoryComment(storyIdx, userIdx, page);

  return res.send(getStoryComment);
}

/*
  API No. 5.12
  API Name: 스토리 댓글 신고 API
  [POST] /with/stories/comments/:commentIdx/reported
  body: reportedReasonIdx, etcReason
*/
exports.reportStoryComment = async (req, res) => {
  const {commentIdx: storyCommentIdx} = req.params;
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

  const reportStoryComment = await storyCommentService.reportStoryComment(storyCommentIdx, userIdx, reportedReasonIdx, etcReason);

  return res.send(reportStoryComment);
}