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