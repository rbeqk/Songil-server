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
  [GET] /shop/crafts/:craftIdx
*/
exports.getCraftDetail = async (req, res) => {
  const {craftIdx} = req.params;
  let params = [craftIdx];
  
  //상품 detail
  const productDetail = await productProvider.getCraftDetail(params);

  return res.send(productDetail);
}