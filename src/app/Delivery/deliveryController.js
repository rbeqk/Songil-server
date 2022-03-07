const baseResponse = require('../../../config/baseResponseStatus');
const { errResponse } = require('../../../config/response');
const deliveryService = require("./deliveryService");
const deliveryProvider = require("./deliveryProvider");
const moment = require('moment');

/*
  API No. 10.7
  API Name: 발송정보 입력 API
  [POST] /artist-page/orders/:orderDetailIdx/sending
  body: year, month, day, tCode, tInvoice
*/
exports.createSendingInfo = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;
  const {year, month, day, tCode, tInvoice} = req.body;

  if (!(year && month && day && tCode && tInvoice)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!moment(`${year}-${month}-${day}`, "YYYY-MM-DD").isValid()) return res.send(errResponse(baseResponse.EXCEED_DATE));

  const sentAt = moment(new Date(`${year}-${month}-${day}`)).format("YYYY-MM-DD");

  const createSendingInfo = await deliveryService.createSendingInfo(userIdx, orderCraftIdx, sentAt, tCode, tInvoice);
  return res.send(createSendingInfo);
}

/*
  API No. 10.8
  API Name: 발송정보 조회 API
  [GET] /artist-page/orders/:orderDetailIdx/sending
*/
exports.getSendingInfo = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;

  const getSendingInfo = await deliveryProvider.getSendingInfo(userIdx, orderCraftIdx);

  return res.send(getSendingInfo);
}

/*
  API No. 8.13
  API Name: 배송 현황 조회 API
  [GET] /my-page/orders/:orderDetailIdx/delivery
*/
exports.getTrackingInfo = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;

  const getTrackingInfo = await deliveryProvider.getTrackingInfo(userIdx, orderCraftIdx);

  return res.send(getTrackingInfo);
}