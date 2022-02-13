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