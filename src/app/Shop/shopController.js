const shopProvider = require("./shopProvider");
const shopService = require("./shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");


exports.getProductDetail = async (req, res) => {
  const {productIdx} = req.params;

  let params = [productIdx];
  
  //상품 detail
  const productDetail = await shopProvider.getProductDetail(params);

  return res.send(productDetail);
}