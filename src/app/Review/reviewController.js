const reviewProvider = require("./reviewProvider");
const reviewService = require("./reviewService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.13
  API Name: 상품 리뷰 페이지 개수 조회 API
  [GET] /shop/products/:productIdx/reviews/page
*/
exports.getReviewTotalPage = async (req, res) => {
  const {onlyPhoto} = req.query;
  const {productIdx} = req.params;

  if (!onlyPhoto) return res.send(errResponse(baseResponse.IS_EMPTY));

  let params = [productIdx, onlyPhoto];
  const getReviewTotalPage = await reviewProvider.getReviewTotalPage(params);

  return res.send(getReviewTotalPage);
}

/*
  API No. 3.12
  API Name: 상품 리뷰 조회 API
  [GET] /shop/products/:productIdx/reviews
  query: page
*/
exports.getReview = async (req, res) => {
  const {page, onlyPhoto} = req.query;
  if (!(page && onlyPhoto)) return res.send(errResponse(baseResponse.IS_EMPTY));

  const token = req.headers['x-access-token'];
  const {productIdx} = req.params;
  let params = [token];

  params = [productIdx, page, onlyPhoto];

  const getReview = await reviewProvider.getReview(params);

  return res.send(getReview);
}