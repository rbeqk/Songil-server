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