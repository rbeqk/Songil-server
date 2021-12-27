const myPageProvider = require('./myPageProvider');
const myPageService = require('./myPageService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 8.6
  API Name: 내 코멘트 페이지 개수 조회 API
  [GET] /my-page/comments/page
  query: type
*/
exports.getMyCommentTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {type} = req.query;

  if (!type) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['available', 'written'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const getMyCommentTotalPage = await myPageProvider.getMyCommentTotalPage(userIdx, type);

  return res.send(getMyCommentTotalPage);
}

/*
  API No. 8.7
  API Name: 내 코멘트 조회 API
  [GET] /my-page/comments
  query: type, page
*/
exports.getMyComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {type, page} = req.query;

  if (!(type && page)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));
  if (!['available', 'written'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const getMyComment = await myPageProvider.getMyComment(userIdx, type, page);

  return res.send(getMyComment);
}

/*
  API No. 8.10
  API Name: 좋아요한 게시글 페이지 개수 조회 API
  [GET] /my-page/with/liked/page
*/
exports.getLikePostCnt = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getLikePostCnt = await myPageProvider.getLikePostCnt(userIdx);

  return res.send(getLikePostCnt);
}

/*
  API No. 8.11
  API Name: 좋아요한 게시글 조회 API
  [GET] /my-page/with/liked
  query: page
*/
exports.getLikedPost = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const getLikedPost = await myPageProvider.getLikedPost(userIdx, page);

  return res.send(getLikedPost);
}