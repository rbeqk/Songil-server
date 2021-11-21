const shopProvider = require("./shopProvider");
const shopService = require("./shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.11
  API Name: 상품 상세 조회 API
  [GET] /shop/products/:productIdx
*/
exports.getProductDetail = async (req, res) => {
  const token = req.headers['x-access-token'];
  let params = [token];

  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret);
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  const {productIdx} = req.params;
  params = [productIdx];
  
  //상품 detail
  const productDetail = await shopProvider.getProductDetail(params);

  return res.send(productDetail);
}

/*
  API No. 3.14
  API Name: 1:1 문의하기 작성 (사용자) API
  [POST] /shop/products/:productIdx/ask
*/
exports.createProductAsk = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {content} = req.body;
  const {productIdx} = req.params;

  if (!content) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (content.length > 300) return res.send(errResponse(baseResponse.EXCEED_ASK_CONTENT));

  let params = [userIdx, productIdx, content];
  const createProductAsk = await shopService.createProductAsk(params);

  return res.send(createProductAsk);
}