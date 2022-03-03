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
exports.getOrderListPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {type} = req.query;
  if (!type) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['basic', 'cancelOrReturn'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const getOrderListPage = await artistPageProvider.getOrderListPage(userIdx, type);

  return res.send(getOrderListPage);
}

/*
  API No. 10.7
  API Name: 주문 현황 조회 및 반품/취소 요청 현황 조회 API
  [GET] /artist-page/orders
  query: type, page
*/
exports.getOrderList = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {type, page} = req.query;
  if (!(type && page)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));
  if (!['basic', 'cancelOrReturn'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const getOrderList = await artistPageProvider.getOrderList(userIdx, type, page);

  return res.send(getOrderList);
}

/*
  API No. 10.1
  API Name: 작가페이지 조회 API
  [GET] /artist-page
*/
exports.getArtistPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getArtistPage = await artistPageProvider.getArtistPage(userIdx);

  return res.send(getArtistPage);
}