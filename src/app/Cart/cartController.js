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