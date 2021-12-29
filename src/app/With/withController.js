const baseResponseStatus = require('../../../config/baseResponseStatus');
const { errResponse } = require('../../../config/response');
const withProvider = require("./withProvider");

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