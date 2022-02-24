const artistPageProvider = require('./artistPageProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 10.9
  API Name: 주문자 정보 확인 API
  [GET] /artist-page/orders/:orderDetailIdx
*/
exports.getOrderCraftUserInfo = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;

  const getOrderCraftUserInfo = await artistPageProvider.getOrderCraftUserInfo(userIdx, orderCraftIdx);

  return res.send(getOrderCraftUserInfo);
}

/*
  API No. 10.6
  API Name: 주문 현황 조회 및 반품/취소 요청 현황 페이지 조회 API
  [GET] /artist-page/orders/page
  query: type
*/
exports.getOrderList = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {type} = req.query;
  if (!['basic', 'cancelOrReturn'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const getOrderList = await artistPageProvider.getOrderList(userIdx, type);

  return res.send(getOrderList);
}