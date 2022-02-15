const baseResponse = require('../../../config/baseResponseStatus');
const { errResponse } = require('../../../config/response');
const deliveryService = require("./deliveryService");
const moment = require('moment');

/*
  API No. 10.7
  API Name: 발송정보 입력 API
  [POST] /artist-page/ordrers/:orderDetailIdx/sending
  body: year, month, day, tCode, tInvoice
*/
exports.createDeliveryInfo = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;
  const {year, month, day, tCode, tInvoice} = req.body;

  if (!(year && month && day && tCode && tInvoice)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!moment(`${year}-${month}-${day}`, "YYYY-MM-DD").isValid()) return res.send(errResponse(baseResponse.EXCEED_DATE));

  const sentAt = moment(new Date(`${year}-${month}-${day}`)).format("YYYY-MM-DD");

  const createDeliveryInfo = await deliveryService.createDeliveryInfo(userIdx, orderCraftIdx, sentAt, tCode, tInvoice);
  return res.send(createDeliveryInfo);
}