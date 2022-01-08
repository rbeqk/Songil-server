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
  API No. 8.14
  API Name: 내가 쓴 글 페이지 개수 조회 API
  [GET] /my-page/with/page
*/
exports.getUserWrittenWithTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  
  const getUserWrittenWithTotalPage = await myPageProvider.getUserWrittenWithTotalPage(userIdx);

  return res.send(getUserWrittenWithTotalPage);
}

/*
  API No. 8.15
  API Name: 내가 쓴 글 조회 API
  [GET] /my-page/with
  query: page
*/
exports.getUserWrittenWith = async (req, res) => {
  const {page} = req.query;
  const {userIdx} = req.verifiedToken;

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const getUserWrittenWith = await myPageProvider.getUserWrittenWith(userIdx, page);

  return res.send(getUserWrittenWith);
}