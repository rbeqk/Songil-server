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