const orderStatusProvider = require('./orderStatusProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {errResponse} = require("../../../config/response");

/*
  API No. 8.12
  API Name: 결제 정보 조회 API
  [GET] /my-page/orders/:orderDetailIdx
*/
exports.getOrderDetail = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;

  const getOrderDetail = await orderStatusProvider.getOrderDetail(userIdx, orderCraftIdx);

  return res.send(getOrderDetail);
}

/*
  API No. 8.11
  API Name: 주문 현황 조회 API
  [GET] /my-page/orders
  query: page
*/
exports.getOrderList = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));

  const getOrderList = await orderStatusProvider.getOrderList(userIdx, page);

  return res.send(getOrderList);
}