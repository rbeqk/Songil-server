const shopProvider = require("../../app/Shop/shopProvider");
const shopService = require("../../app/Shop/shopService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

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