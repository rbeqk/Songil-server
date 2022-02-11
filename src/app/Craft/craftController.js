const craftProvider = require("./craftProvider");
const craftService = require("./craftService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require("../../../modules/userUtil");

/*
  API No. 3.11
  API Name: 상품 상세 조회 API
  [GET] /shop/crafts/:craftIdx
*/
exports.getCraftDetail = async (req, res) => {
  const {craftIdx} = req.params;
  const token = req.headers['x-access-token'];
  const userIdx = await getUserIdx(token);

  const craftDetail = await craftProvider.getCraftDetail(userIdx, craftIdx);

  return res.send(craftDetail);
}