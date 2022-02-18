const orderCancelService = require('./orderCancelService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 8.15
  API Name: 주문취소 요청 API
  [POST] /my-page/orders/:orderDetailIdx/cancel
  body: reasonIdx, etcReason
*/
exports.reqOrderCraftCancel = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderDetailIdx: orderCraftIdx} = req.params;
  const {reasonIdx, etcReason} = req.body;

  if (!reasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reasonIdx < 1 || reasonIdx > 7) return res.send(errResponse(baseResponse.INVALID_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reasonIdx == 7 && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reasonIdx != 7 && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > 150) return res.send(errResponse(baseResponse.EXCEED_ETC_REASON));

  const reqOrderCraftCancel = await orderCancelService.reqOrderCraftCancel(userIdx, orderCraftIdx, reasonIdx, etcReason);
  
  return res.send(reqOrderCraftCancel);
}