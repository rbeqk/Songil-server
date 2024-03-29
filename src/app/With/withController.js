const baseResponseStatus = require('../../../config/baseResponseStatus');
const { errResponse } = require('../../../config/response');
const withProvider = require("./withProvider");
const withService = require("./withService");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 5.1
  API Name: hot talk 조회 API
  [GET] /with/hot-talk
*/
exports.getHotTalk = async (req, res) => {  
  const getHotTalk = await withProvider.getHotTalk();

  return res.send(getHotTalk);
}

/*
  API No. 5.2
  API Name: 카테고리 별 WITH 페이지 개수 조회 API
  [GET] /with/page
  query: category
*/
exports.getTotalWithPage = async (req, res) => {
  const {category} = req.query;
  const token = req.headers['x-access-token'];
  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponseStatus.TOKEN_VERIFICATION_FAILURE));
  
  if (!category) return res.send(errResponse(baseResponseStatus.IS_EMPTY));
  if (!['story', 'qna', 'ab-test'].includes(category)) return res.send(errResponse(baseResponseStatus.INVALID_CATEGORY_NAME));
  const getTotalWithPage = await withProvider.getTotalWithPage(userIdx, category);

  return res.send(getTotalWithPage);
}

/*
  API No. 5.3
  API Name: 카테고리 별 WITH 조회 API
  [GET] /with
  query: category, sort, page
*/
exports.getWith = async (req, res) => {
  const {category, sort, page} = req.query;
  const token = req.headers['x-access-token'];

  if (!(category && page)) return res.send(errResponse(baseResponseStatus.IS_EMPTY));
  if (!['story', 'qna', 'ab-test'].includes(category)) return res.send(errResponse(baseResponseStatus.INVALID_CATEGORY_NAME));
  if (['story', 'qna'].includes(category) && !sort) return res.send(errResponse(baseResponseStatus.IS_EMPTY));
  if (sort && !['popular', 'new'].includes(sort)) return res.send(errResponse(baseResponseStatus.INVALID_SORT_NAME));

  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponseStatus.TOKEN_VERIFICATION_FAILURE));

  const getWith = await withProvider.getWith(category, sort, page, userIdx);

  return res.send(getWith);
}

/*
  API No. 5.0
  API Name: WITH 쪽 유저 차단 API
  [POST] /with/users/:userIdx/block
*/
exports.blockUser = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {userIdx: blockUserIdx} = req.params;

  if (userIdx == blockUserIdx){
    return res.send(errResponse(baseResponseStatus.CAN_NOT_BLOCK_SELF));
  }

  const blockUser = await withService.blockUser(userIdx, blockUserIdx);

  return res.send(blockUser);
}