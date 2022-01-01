const storyCommentProvider = require("./storyCommentProvider");
const storyCommentService = require("./storyCommentService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../config/userInfo');

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