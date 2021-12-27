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
  API No. 5.10
  API Name: 스토리 등록 API
  [POST] /with/stories
  body: title, content, tag, image
*/
exports.createStory = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {title, content, tag} = req.body;

  if (!(title && content)) return res.send(errResponse(baseResponse.IS_EMPTY));

  if (title.length > 100) return res.send(errResponse(baseResponse.EXCEED_STORY_TITLE));
  if (content.length > 2000) return res.send(errResponse(baseResponse.EXCEED_STORY_CONTENT));
  if (tag && tag.length > 3) return res.send(errResponse(baseResponse.EXCEED_STORY_TAG));

  const imageArr = req.files.map(item => item.location);

  const createStory = await storyService.createStory(userIdx, title, content, tag, imageArr);
  
  return res.send(createStory);
}

/*
  API No. 5.20
  API Name: 스토리 삭제 API
  [DELETE] /with/stories/:storyIdx
*/
exports.deleteStory = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {storyIdx} = req.params;

  const deleteStory = await storyService.deleteStory(userIdx, storyIdx);

  return res.send(deleteStory);
}

/*
  API No. 5.18
  API Name: 스토리 수정 API
  [PATCH] /with/stories/:storyIdx
  body: title, content, tag, image
*/
exports.updateStory = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {title, content, tag} = req.body;
  const {storyIdx} = req.params;

  if (!(title || content || tag || req.files)) return res.send(errResponse(baseResponse.UPDATE_INFO_EMPTY));

  if (title && title.length > 100) return res.send(errResponse(baseResponse.EXCEED_STORY_TITLE));
  if (content && content.length > 2000) return res.send(errResponse(baseResponse.EXCEED_STORY_CONTENT));
  if (tag && tag.length > 3) return res.send(errResponse(baseResponse.EXCEED_STORY_TAG));

  let imageArr;
  if (req.files?.length){
    imageArr = req.files.map(item => item.location);
  }

  const updateStory = await storyService.updateStory(storyIdx, userIdx, title, content, tag, imageArr);

  return res.send(updateStory);
}