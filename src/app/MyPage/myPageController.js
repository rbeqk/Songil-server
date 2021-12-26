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