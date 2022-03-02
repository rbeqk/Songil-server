const craftCommentController = require("./craftCommentProvider");
const craftCommentService = require("./craftCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 3.13
  API Name: 상품 댓글 페이지 개수 조회 API
  [GET] /shop/crafts/:craftIdx/comments/page
  query: type
*/
exports.getCommentTotalPage = async (req, res) => {
  const {type} = req.query;
  const {craftIdx} = req.params;

  if (!type) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['all', 'photo'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const getCommentTotalPage = await craftCommentController.getCommentTotalPage(craftIdx, type);

  return res.send(getCommentTotalPage);
}

/*
  API No. 3.12
  API Name: 상품 댓글 조회 API
  [GET] /shop/crafts/:craftIdx/comments
  query: page, type
*/
exports.getComment = async (req, res) => {
  const {page, type} = req.query;
  const {craftIdx} = req.params;

  if (!(page && type)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['all', 'photo'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const getComment = await craftCommentController.getComment(craftIdx, page, type);

  return res.send(getComment);
}

/*
  API No. 3.15
  API Name: 상품 댓글 신고 API
  [POST] /shop/crafts/comments/:commentIdx/reported
  body: reportedReasonIdx, etcReason
*/
exports.reportComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {commentIdx: craftCommentIdx} = req.params;
  const {reportedReasonIdx, etcReason} = req.body;

  if (!reportedReasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reportedReasonIdx < 1 || reportedReasonIdx > 7) return res.send(errResponse(baseResponse.INVALID_REPORTED_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reportedReasonIdx == 7 && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reportedReasonIdx != 7 && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > 150) return res.send(errResponse(baseResponse.EXCEED_REPORTED_REASON));

  const reportComment = await craftCommentService.reportComment(userIdx, craftCommentIdx, reportedReasonIdx, etcReason);

  return res.send(reportComment);
}

/*
  API No. 8.17
  API Name: 상품 댓글 작성 API
  [POST] /my-page/crafts/comments
  body: orderDetailIdx, comment, image
*/
exports.createCraftComment = async (req, res) => {
  const {orderDetailIdx: orderCraftIdx, comment} = req.body;
  const {userIdx} = req.verifiedToken;

  if (!(comment && orderCraftIdx)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (comment.length > 500) return res.send(errResponse(baseResponse.EXCEED_CRAFT_COMMENT));

  const imageArr = req.files.map(item => item.location);
  if (imageArr.length > 3) return res.send(errResponse(baseResponse.EXCEED_IMAGE_QUANTITY));

  const createCraftComment = await craftCommentService.createCraftComment(userIdx, orderCraftIdx, comment, imageArr);

  return res.send(createCraftComment);
}