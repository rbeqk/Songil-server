const likeService = require('./likeService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 3.15
  API Name: 상품 좋아요 변경 API
  [PATCH] /shop/products/:productIdx/like
*/
exports.changeCraftLikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {productIdx} = req.params;

  let params = [userIdx, productIdx];

  const changeCraftLikeStatus = await likeService.changeCraftLikeStatus(params);

  return res.send(changeCraftLikeStatus);
}

/*
  API No. 4.3
  API Name: 상품 좋아요 변경 API
  [PATCH] /articles/:articleIdx/like
*/
exports.changeArticleLikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {articleIdx} = req.params;

  const changeArticleLikeStuatus = await likeService.changeArticleLikeStuatus(userIdx, articleIdx);

  return res.send(changeArticleLikeStuatus);
}