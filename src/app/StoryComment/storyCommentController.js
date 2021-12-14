const storyCommentProvider = require("./storyCommentProvider");
const storyCommentService = require("./storyCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 5.5
  API Name: 스토리 댓글 페이지 개수 조회 API
  [GET] /with/stories/:storyIdx/comments/page
*/
exports.getStoryCommentTotalPage = async (req, res) => {
  const {storyIdx} = req.params;

  const getStoryCommentTotalPage = await storyCommentProvider.getStoryCommentTotalPage(storyIdx);

  return res.send(getStoryCommentTotalPage);
}

/*
  API No. 5.16
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