const likeService = require('./likeService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 3.15
  API Name: 이용약관 전체 조회 API
  [PATCH] /shop/products/:productIdx/like
*/
exports.changeLikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {productIdx} = req.params;

  let params = [userIdx, productIdx];

  const changeLikeStauts = await likeService.changeLikeStatus(params);

  return res.send(changeLikeStauts);
}