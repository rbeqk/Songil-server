const shopProvider = require("../../app/Shop/shopProvider");
const shopService = require("../../app/Shop/shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.3
  API Name: shop 쪽 today craft 페이지 개수 조회 API
  [GET] /shop/today-craft/page
*/
exports.getTodayCraftTotalPage = async (req, res) => {
  //현재는 상품 전체 개수의 페이지와 동일
  const getTodayCraftTotalPage = await shopProvider.getTodayCraftTotalPage();

  return res.send(getTodayCraftTotalPage);
}

/*
  API No. 3.2
  API Name: shop 쪽 today craft 조회 API
  [GET] /shop/today-craft
  query: page
*/
exports.getTodayCraft = async (req, res) => {
  const {page} = req.query;
  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  let params = [page];

  const getTodayCraft = await shopProvider.getTodayCraft(params);

  return res.send(getTodayCraft);
}

/*
  API No. 3.1
  API Name: shop 쪽 banner/artist/new 조회 API
  [GET] /shop
*/
exports.getShopEtc = async (req, res) => {
  const getShopEtc = await shopProvider.getShopEtc();

  return res.send(getShopEtc);
}