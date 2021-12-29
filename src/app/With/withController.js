const baseResponseStatus = require('../../../config/baseResponseStatus');
const { errResponse } = require('../../../config/response');
const withProvider = require("./withProvider");
const jwt = require("jsonwebtoken");

require('dotenv').config();

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
  
  if (!category) return res.send(errResponse(baseResponseStatus.IS_EMPTY));
  if (!['story', 'qna', 'ab-test'].includes(category)) return res.send(errResponse(baseResponseStatus.INVALID_CATEGORY_NAME));
  const getTotalWithPage = await withProvider.getTotalWithPage(category);

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

  if (!(category && sort && page)) return res.send(errResponse(baseResponseStatus.IS_EMPTY));
  if (!['story', 'qna', 'ab-test'].includes(category)) return res.send(errResponse(baseResponseStatus.INVALID_CATEGORY_NAME));
  if (!['popular', 'new'].includes(sort)) return res.send(errResponse(baseResponseStatus.INVALID_SORT_NAME));

  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  const getWith = await withProvider.getWith(category, sort, page, userIdx);

  return res.send(getWith);
}