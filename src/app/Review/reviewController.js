const reviewProvider = require("./reviewProvider");
const reviewService = require("./reviewService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.13
  API Name: 상품 리뷰 페이지 개수 조회 API
  [GET] /shop/products/:productIdx/reviews/page
*/
exports.getReviewTotalPage = async (req, res) => {
  const {onlyPhoto} = req.query;
  const {productIdx} = req.params;

  if (!onlyPhoto) return res.send(errResponse(baseResponse.IS_EMPTY));

  let params = [productIdx, onlyPhoto];
  const getReviewTotalPage = await reviewProvider.getReviewTotalPage(params);

  return res.send(getReviewTotalPage);
}

/*
  API No. 3.12
  API Name: 상품 리뷰 조회 API
  [GET] /shop/products/:productIdx/reviews
  query: page
*/
exports.getReview = async (req, res) => {
  const {page, onlyPhoto} = req.query;
  const {productIdx} = req.params;

  if (!(page && onlyPhoto)) return res.send(errResponse(baseResponse.IS_EMPTY));

  let params = [productIdx, page, onlyPhoto];
  const getReview = await reviewProvider.getReview(params);

  return res.send(getReview);
}

/*
  API No. 3.18
  API Name: 리뷰 신고 API
  [POST] /reported-reviews/:productReviewIdx
*/
exports.reportReview = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {productReviewIdx} = req.params;
  const {reportedReasonIdx, etcReason} = req.body;

  const totalReportedReasonLength = 7;  //총 신고 사유 개수
  const etcReasonIdx = 7; //직접입력idx
  const etcReasonLength = 150;  //직접입력 글자수 제한

  if (!reportedReasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!((1 < reportedReasonIdx) && (reportedReasonIdx <= totalReportedReasonLength))) return res.send(errResponse(baseResponse.INVALID_REPORTED_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reportedReasonIdx == etcReasonIdx && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reportedReasonIdx != etcReasonIdx && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > etcReasonLength) return res.send(errResponse(baseResponse.EXCEED_REPORTED_REASON));

  let params = [userIdx, productReviewIdx, reportedReasonIdx, etcReason];
  const reportReview = await reviewService.reportReview(params);

  return res.send(reportReview);
}