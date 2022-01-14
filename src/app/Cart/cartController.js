const cartService = require('./cartService');
const cartProvider = require('./cartProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 11.3
  API Name: 장바구니 상품 추가 API
  [POST] /cart/crafts/:craftIdx
  body: amount
*/
exports.addCartCraft = async (req, res) => {
  const {craftIdx} = req.params;
  const {amount} = req.body;
  const {userIdx} = req.verifiedToken;

  if (!amount) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (amount < 1) return res.send(errResponse(baseResponse.INVALID_AMOUNT));

  const addCartCraft = await cartService.addCartCraft(craftIdx, amount, userIdx);

  return res.send(addCartCraft);
}

/*
  API No. 11.2
  API Name: 장바구니 조회 API
  [GET] /cart
*/
exports.getCart = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getCart = await cartProvider.getCart(userIdx);

  return res.send(getCart);
}

/*
  API No. 11.1
  API Name: 장바구니 상품 개수 조회 API
  [GET] /cart/count
*/
exports.getCartCnt = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getCartCnt = await cartProvider.getCartCnt(userIdx);

  return res.send(getCartCnt);
}

/*
  API No. 11.4
  API Name: 장바구니 상품 삭제 API
  [DELETE] /cart/crafts/:craftIdx
*/
exports.deleteCartCraft = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {craftIdx} = req.params;

  const deleteCartCraft = await cartService.deleteCartCraft(userIdx, craftIdx);

  return res.send(deleteCartCraft);
}

/*
  API No. 11.5
  API Name: 장바구니 상품 수량 수정 API
  [PATCH] /cart/crafts/:craftIdx
  body: amountChange
*/
exports.updateCartCraft = async (req, res) => {
  const {craftIdx} = req.params;
  const {userIdx} = req.verifiedToken;
  const {amountChange} = req.body;

  if (!amountChange) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (![1, -1].includes(amountChange)) return res.send(errResponse(baseResponse.INVALID_AMOUNT_CHANGE));

  const updateCartCraft = await cartService.updateCartCraft(craftIdx, userIdx, amountChange);

  return res.send(updateCartCraft);
}