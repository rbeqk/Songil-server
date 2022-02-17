const orderProvider = require('./orderProvider');
const orderService = require('./orderService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const validator = require("validator");

/*
  API No. 12.1
  API Name: 주문서 상품 추가 API
  [POST] /order/crafts
  body: crafts
*/
exports.addCraftInOrderSheet = async (req, res) => {
  const {crafts} = req.body;
  const {userIdx} = req.verifiedToken;

  if (!crafts) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!Array.isArray(crafts)) return res.send(errResponse(baseResponse.INVALID_FORMAT_TYPE));
  if (crafts.length < 1) return res.send(errResponse(baseResponse.IS_EMPTY));
  
  for (let item of crafts){
    if (typeof item !== 'object') return res.send(errResponse(baseResponse.INVALID_FORMAT_TYPE));
    if (!item.hasOwnProperty('craftIdx')) return res.send(errResponse(baseResponse.INVALID_FORMAT_TYPE));
    if (!item.hasOwnProperty('amount')) return res.send(errResponse(baseResponse.INVALID_FORMAT_TYPE));
  }
  if (crafts.filter(item => item.amount < 1).length > 0) return res.send(errResponse(baseResponse.INVALID_AMOUNT));

  const addCraftInOrderSheet = await orderService.addCraftInOrderSheet(userIdx, crafts);
  
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

/*
  API No. 12.5
  API Name: 배송지 정보 및 사용 포인트 저장 API
  [POST] /order/:orderIdx/etc-info
  body: recipient, phone, address, detailAddress, memo, pointDiscount
*/
exports.updateOrderEtcInfo = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderIdx} = req.params;
  const {recipient, phone, address, detailAddress, memo, pointDiscount} = req.body;

  if (!(recipient && phone && address && detailAddress) || pointDiscount === undefined){
    return res.send(errResponse(baseResponse.IS_EMPTY));
  }
  if (!validator.isMobilePhone(phone, 'ko-KR')) return res.send(errResponse(baseResponse.INVALID_PHONE_PATTERN));
  if (pointDiscount < 0) return res.send(errResponse(baseResponse.INVALID_POINT));
  if (memo && memo.length > 50) return res.send(errResponse(baseResponse.EXCEED_MEMO_LENGTH));

  const updateOrderEtcInfo = await orderService.updateOrderEtcInfo(
    userIdx, orderIdx, recipient, phone, address, detailAddress, memo, pointDiscount
  );

  return res.send(updateOrderEtcInfo);
}

/*
  API No. 12.6
  API Name: 결제 검증 API
  [POST] /order/:orderIdx
  body: receiptId
*/
exports.validatePayment = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderIdx} = req.params;
  const {receiptId} = req.body;

  if (!receiptId) return res.send(errResponse(baseResponse.IS_EMPTY));

  const validatePayment = await orderService.validatePayment(userIdx, orderIdx, receiptId);

  return res.send(validatePayment);
}