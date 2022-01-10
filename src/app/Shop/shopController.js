const shopProvider = require("../../app/Shop/shopProvider");
const shopService = require("../../app/Shop/shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require("../../../modules/userUtil");

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
  API Name: 카테고리 별 상품 페이지 개수 조회 API
  [GET] /shop/craft/page
  query: categoryIdx
*/
exports.getCraftByCategoryTotalPage = async (req, res) => {
  const {categoryIdx: craftCategoryIdx} = req.query;
  if (!craftCategoryIdx) return res.send(errResponse(baseResponse.IS_EMPTY));

  //1: 도자공예, 2: 유리공예, 3: 금속공예, 4: 목공예, 5: 섬유공예, 6: 가죽공예, 7: 기타공예, 8: 전체
  if (craftCategoryIdx < 1 || craftCategoryIdx > 8) return res.send(errResponse(baseResponse.INVALID_CATEGORY_IDX));

  const getCraftByCategoryTotalPage = await shopProvider.getCraftByCategoryTotalPage(craftCategoryIdx);

  return res.send(getCraftByCategoryTotalPage);
}

/*
  API No. 3.3
  API Name: 카테고리 별 상품 조회 API
  [GET] /shop/craft
  query: categoryIdx, page, sort
*/
exports.getCraftByCategory = async (req, res) => {
  const {categoryIdx: craftCategoryIdx, page, sort} = req.query;
  
  if (!(craftCategoryIdx && page && sort)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  //1: 도자공예, 2: 유리공예, 3: 금속공예, 4: 목공예, 5: 섬유공예, 6: 가죽공예, 7: 기타공예, 8: 전체
  if (craftCategoryIdx < 1 || craftCategoryIdx > 8) return res.send(errResponse(baseResponse.INVALID_CATEGORY_IDX));
  if (!['popular', 'new', 'comment', 'price'].includes(sort)) return res.send(errResponse(baseResponse.INVALID_SORT_NAME));

  const token = req.headers['x-access-token'];
  const userIdx = getUserIdx(token);

  const getCraftByCategory = await shopProvider.getCraftByCategory(userIdx, craftCategoryIdx, page, sort);

  return res.send(getCraftByCategory);
}

/*
  API No. 3.4
  API Name: 카테고리 별 이번주 인기 상품 조회 API
  [GET] /shop/crafts/popular
  query: categoryIdx
*/
exports.getWeeklyPopularCraft = async (req, res) => {
  const {categoryIdx} = req.query;

  if (!categoryIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (categoryIdx < 0 || categoryIdx > 9) return res.send(errResponse(baseResponse.INVALID_CATEGORY_IDX));

  const getWeeklyPopularCraft = await shopProvider.getWeeklyPopularCraft(categoryIdx);

  return res.send(getWeeklyPopularCraft);
}