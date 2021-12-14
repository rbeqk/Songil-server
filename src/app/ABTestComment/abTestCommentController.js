const abTestCommentProvider = require("./abTestCommentProvider");
const abTestCommentService = require("./abTestCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 5.18
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