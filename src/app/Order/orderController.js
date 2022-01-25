const orderProvider = require('./orderProvider');
const orderService = require('./orderService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 12.1
  API Name: 주문서 상품 추가 API
  [POST] /order/crafts
  body: craftIdxArr, amountArr
*/
exports.addCraftInOrderSheet = async (req, res) => {
  const {craftIdxArr, amountArr} = req.body;
  const {userIdx} = req.verifiedToken;

  if (!(craftIdxArr && amountArr)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (craftIdxArr.length !== amountArr.length) return res.send(errResponse(baseResponse.INVALID_CRAFT_AMOUNT_LENGTH));
  if (amountArr.filter(item => item < 1).length > 0) return res.send(errResponse(baseResponse.INVALID_AMOUNT));

  const addCraftInOrderSheet = await orderService.addCraftInOrderSheet(userIdx, craftIdxArr, amountArr);
  
  return res.send(addCraftInOrderSheet);
}

/*
  API No. 12.3
  API Name: 베네핏 적용 API
  [POST] /order/:orderIdx/benefits
  body: benefitIdx
*/
exports.applyOrderBenefit = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderIdx} = req.params;
  const {benefitIdx} = req.body;

  if (!benefitIdx) return res.send(errResponse(baseResponse.IS_EMPTY));

  const applyOrderBenefit = await orderService.applyOrderBenefit(userIdx, orderIdx, benefitIdx);

  return res.send(applyOrderBenefit);
}

/*
  API No. 12.2
  API Name: 추가 배송비 적용 및 조회 API
  [POST] /order/:orderIdx/extra-fee
  body: zipcode
*/
exports.updateOrderExtraShippingFee = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderIdx} = req.params;
  const {zipcode} = req.body;

  if (!zipcode) return res.send(errResponse(baseResponse.IS_EMPTY));

  const updateOrderExtraShippingFee = await orderService.updateOrderExtraShippingFee(userIdx, orderIdx, zipcode);

  return res.send(updateOrderExtraShippingFee);
}