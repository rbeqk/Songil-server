const storyProvider = require("./storyProvider");
const storyService = require("./storyService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 5.4
  API Name: 스토리 상세 조회 API
  [GET] /with/stories/:storyIdx
*/
exports.getStoryDetail = async (req, res) => {
  const {storyIdx} = req.params;
  const token = req.headers['x-access-token'];

  //jwt가 있을 경우 유효한지 확인
  let userIdx;
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    }
  }

  const getStoryDetail = await storyProvider.getStoryDetail(storyIdx, userIdx);

  return res.send(getStoryDetail);
}

/*
  API No. 5.19
  API Name: 스토리 좋아요 여부 변경 API
  [GET] /with/stories/:storyIdx/like
*/
exports.changeUserStoryLikeStatus = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {storyIdx} = req.params;

  const changeUserStoryLikeStatus = await storyService.changeUserStoryLikeStatus(userIdx, storyIdx);

  return res.send(changeUserStoryLikeStatus);
}