const qnaCommentProvider = require("./qnaCommentProvider");
const qnaCommentService = require("./qnaCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

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