const myPageProvider = require('./myPageProvider');
const myPageService = require('./myPageService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

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

/*
  API No. 8.13
  API Name: 댓글 단 글 조회 API
  [GET] /my-page/with/comments
  query: page
*/
exports.getUserWrittenWithComment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const getUserWrittenWithComment = await myPageProvider.getUserWrittenWithComment(userIdx, page);
  return res.send(getUserWrittenWithComment);
}

/*
  API No. 8.10
  API Name: 프로필 수정 API
  [PATCH] /my-page/profile
  body: setDefault, userName, userProfile
*/
exports.updateUserProfile = async (req, res) => {
  const {setDefault, userName} = req.body;
  const userProfile = req.file?.location;
  const {userIdx} = req.verifiedToken;

  if (!(setDefault || userName || userProfile)) return res.send(errResponse(baseResponse.UPDATE_INFO_EMPTY));
  if (userName && userName.length > 10) return res.send(errResponse(baseResponse.EXCEED_NICKNAME));
  
  const updateUserProfile = await myPageService.updateUserProfile(userIdx, setDefault, userName, userProfile);
  return res.send(updateUserProfile);
}

/*
  API No. 8.2
  API Name: 마이페이지 조회 API
  [GET] /my-page
*/
exports.getMyPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getMyPage = await myPageProvider.getMyPage(userIdx);
  return res.send(getMyPage);
}