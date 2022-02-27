const noticeProvider = require('./noticeProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 13.2
  API Name: 공지사항 조회 API
  [GET] /notice
*/
exports.getNotice = async (req, res) => {
  const getNotice = await noticeProvider.getNotice();

  return res.send(getNotice);
}