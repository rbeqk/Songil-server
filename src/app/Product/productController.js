const productProvider = require("./productProvider");
const productService = require("./productService");
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
  const {productIdx} = req.params;
  let params = [productIdx];
  
  //상품 detail
  const productDetail = await productProvider.getProductDetail(params);

  return res.send(productDetail);
}