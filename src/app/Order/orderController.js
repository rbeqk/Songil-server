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