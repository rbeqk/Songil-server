const shopProvider = require("../../app/Shop/shopProvider");
const shopService = require("../../app/Shop/shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 3.1
  API Name: shop 쪽 banner/artist/new 조회 API
  [GET] /shop
*/
exports.getShop = async (req, res) => {
  const getShop = await shopProvider.getShop();

  return res.send(getShop);
}

/*
  API No. 3.7
  API Name: 카테고리 별 전체 상품 페이지 개수 조회 API
  [GET] /shop/craft/page
  query: categoryIdx
*/
exports.getProductByCategoryTotalPage = async (req, res) => {
  const {categoryIdx: craftCategoryIdx} = req.query;
  if (!craftCategoryIdx) return res.send(errResponse(baseResponse.IS_EMPTY));

  //1: 도자공예, 2: 유리공예, 3: 금속공예, 4: 목공예, 5: 섬유공예, 6: 가죽공예, 7: 기타공예
  if (craftCategoryIdx <=0 || craftCategoryIdx > 7) return res.send(errResponse(baseResponse.INVALID_CATEGORY_IDX));

  const getProductByCategoryTotalPage = await shopProvider.getProductByCategoryTotalPage(craftCategoryIdx);

  return res.send(getProductByCategoryTotalPage);
}