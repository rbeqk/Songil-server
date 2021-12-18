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
  API No. 5.13
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