const reviewProvider = require("./reviewProvider");
const reviewService = require("./reviewService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

/*
  API No. 3.13
  API Name: 상품 리뷰 페이지 개수 조회 API
  [GET] /shop/products/:productIdx/reviews/page
*/
exports.getReviewTotalPage = async (req, res) => {
  const {productIdx} = req.params;

  let params = [productIdx];
  const getReviewTotalPage = await reviewProvider.getReviewTotalPage(params);

  return res.send(getReviewTotalPage);
}