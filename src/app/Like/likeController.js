const likeProvider = require('./likeProvider');
const likeService = require('./likeService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 3.15
  API Name: 상품 좋아요 변경 API
  [PATCH] /shop/crafts/:craftIdx/like
*/
exports.changeCraftLikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {craftIdx} = req.params;

  const changeCraftLikeStatus = await likeService.changeCraftLikeStatus(userIdx, craftIdx);

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

/*
  API No. 4.3
  API Name: 좋아요한 아티클 페이지 개수 조회 API
  [GET] /my-page/articles/liked/page
*/
exports.getLikedArticleTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getLikedArticleTotalPage = await likeProvider.getLikedArticleTotalPage(userIdx);

  return res.send(getLikedArticleTotalPage);
}

/*
  API No. 8.9
  API Name: 좋아요한 아티클 조회 API
  [GET] /my-page/articles/liked
  query: page
*/
exports.getLikedArticle = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {page} = req.query;

  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const getLikedArticle = await likeProvider.getLikedArticle(userIdx, page);

  return res.send(getLikedArticle);
}

/*
  API No. 8.4
  API Name: 찜한 상품 페이지 개수 조회 API
  [GET] /my-page/crafts/liked
*/
exports.getLikedCraftTotalPage = async (req, res) => {
  const {userIdx} = req.verifiedToken;

  const getLikedCraftTotalPage = await likeProvider.getLikedCraftTotalPage(userIdx);

  return res.send(getLikedCraftTotalPage);
}

/*
  API No. 8.5
  API Name: 찜한 상품 조회 API
  [GET] /my-page/crafts/liked
  query: page
*/
exports.getLikedCraft = async (req, res) => {
  const {page} = req.query;
  if (!page) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (page < 1) return res.send(errResponse(baseResponse.INVALID_PAGE));

  const {userIdx} = req.verifiedToken;

  const getLikedCraft = await likeProvider.getLikedCraft(userIdx, page);

  return res.send(getLikedCraft);
}

/*
  API No. 5.17
  API Name: QnA 좋아요 여부 변경 API
  [PATCH] /with/qna/:qnaIdx/like
*/
exports.changeQnALikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {qnaIdx} = req.params;

  const changeQnALikeStatus = await likeService.changeQnALikeStatus(userIdx, qnaIdx);

  return res.send(changeQnALikeStatus);
}

/*
  API No. 5.16
  API Name: 스토리 좋아요 여부 변경 API
  [GET] /with/stories/:storyIdx/like
*/
exports.changeUserStoryLikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {storyIdx} = req.params;

  const changeUserStoryLikeStatus = await likeService.changeUserStoryLikeStatus(userIdx, storyIdx);

  return res.send(changeUserStoryLikeStatus);
}