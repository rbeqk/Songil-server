const reviewProvider = require("./reviewProvider");
const reviewService = require("./reviewService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.13
  API Name: 상품 댓글 페이지 개수 조회 API
  [GET] /shop/crafts/:craftIdx/comments/page
  query: onlyPhoto
*/
exports.getCommentTotalPage = async (req, res) => {
  const {onlyPhoto} = req.query;
  const {craftIdx} = req.params;

  if (!onlyPhoto) return res.send(errResponse(baseResponse.IS_EMPTY));

  let params = [craftIdx, onlyPhoto];
  const getCommentTotalPage = await reviewProvider.getCommentTotalPage(params);

  return res.send(getCommentTotalPage);
}

/*
  API No. 3.12
  API Name: 상품 댓글 조회 API
  [GET] /shop/crafts/:craftIdx/comments
  query: page, onlyPhoto
*/
exports.getComment = async (req, res) => {
  const {page, onlyPhoto} = req.query;
  const {craftIdx} = req.params;

  if (!(page && onlyPhoto)) return res.send(errResponse(baseResponse.IS_EMPTY));

  const getComment = await reviewProvider.getComment(craftIdx, page, onlyPhoto);

  return res.send(getComment);
}

/*
  API No. 3.18
  API Name: 상품 댓글 신고 API
  [POST] /comments/:commentIdx/reported
*/
exports.reportComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {commentIdx: craftCommentIdx} = req.params;
  const {reportedReasonIdx, etcReason} = req.body;

  const totalReportedReasonLength = 7;  //총 신고 사유 개수
  const etcReasonIdx = 7; //직접입력idx
  const etcReasonLength = 150;  //직접입력 글자수 제한

  if (!reportedReasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reportedReasonIdx < 1 || reportedReasonIdx > totalReportedReasonLength) return res.send(errResponse(baseResponse.INVALID_REPORTED_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reportedReasonIdx == etcReasonIdx && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reportedReasonIdx != etcReasonIdx && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > etcReasonLength) return res.send(errResponse(baseResponse.EXCEED_REPORTED_REASON));

  const reportComment = await reviewService.reportComment(userIdx, craftCommentIdx, reportedReasonIdx, etcReason);

  return res.send(reportComment);
}