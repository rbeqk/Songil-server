const orderReturnService = require('./orderReturnService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 8.16
  API Name: 반품 요청 API
  [POST] /my-page/orders/:orderDetailIdx/return
  body: reasonIdx, etcReason
*/
exports.reqOrderCraftReturn = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;
  const {reasonIdx, etcReason} = req.body;

  if (!reasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reasonIdx < 1 || reasonIdx > 4) return res.send(errResponse(baseResponse.INVALID_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reasonIdx == 4 && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reasonIdx != 4 && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > 150) return res.send(errResponse(baseResponse.EXCEED_ETC_REASON));

  const reqOrderCraftReturn = await orderReturnService.reqOrderCraftReturn(userIdx, orderCraftIdx, reasonIdx, etcReason);
  
  return res.send(reqOrderCraftReturn);
}

/*
  API No. 8.17
  API Name: 반품 승인 및 거부 API
  [POST] /artist-page/orders/:orderDetailIdx/return
  body: type
*/
exports.resOrderCraftReturn = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;
  const {type} = req.body;

  if (!['approval', 'rejection'].includes(type)) return res.send(errResponse(baseResponse.INVALID_TYPE_NAME));

  const resOrderCraftReturn = await orderReturnService.resOrderCraftReturn(userIdx, orderCraftIdx, type);

  return res.send(resOrderCraftReturn);
}