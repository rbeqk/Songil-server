const shopProvider = require("./shopProvider");
const shopService = require("./shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

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