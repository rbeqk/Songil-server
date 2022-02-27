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

/*
  API No. 13.3
  API Name: F&Q 조회 API
  [GET] /faq
*/
exports.getFAQ = async (req, res) => {
  const getFAQ = await noticeProvider.getFAQ();

  return res.send(getFAQ);
}