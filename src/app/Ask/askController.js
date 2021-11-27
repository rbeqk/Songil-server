const askService = require('./askService');
const askProvider = require('./askProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 8.2
  API Name: 1:1 문의 내역 페이지 조회 API
  [GET] /mypage/ask/page
*/
exports.getAskTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  let params = [userIdx];
  const getAskTotalPage = await askProvider.getAskTotalPage(params);

  return res.send(getAskTotalPage);
}