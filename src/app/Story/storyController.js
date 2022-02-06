const storyProvider = require("./storyProvider");
const storyService = require("./storyService");
const baseResponse = require("../../../config/baseResponseStatus");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../modules/userUtil');

/*
  API No. 5.4
  API Name: 스토리 상세 조회 API
  [GET] /with/stories/:storyIdx
*/
exports.getStoryDetail = async (req, res) => {
  const {storyIdx} = req.params;
  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

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
  const {title, content} = req.body;
  let {tag} = req.body;

  if (!(title && content) || req.files.length < 1) return res.send(errResponse(baseResponse.IS_EMPTY));

  if (req.files.length > 3) return res.send(errResponse(baseResponse.EXCEED_IMAGE_QUANTITY));

  if (title.length > 100) return res.send(errResponse(baseResponse.EXCEED_STORY_TITLE));
  if (content.length > 2000) return res.send(errResponse(baseResponse.EXCEED_STORY_CONTENT));
  if (tag && Array.isArray(tag) && tag.length > 3) return res.send(errResponse(baseResponse.EXCEED_STORY_TAG));
  if (tag && Array.isArray(tag)){
    tag.map(item => {
      if (item.length > 20) return res.send(errResponse(baseResponse.EXCEED_TAG_LENGTH));
    })
  }
  if (tag && typeof tag == 'string'){
    if (tag.length > 20) return res.send(errResponse(baseResponse.EXCEED_TAG_LENGTH));
    tag = [tag];
  }

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
  const {title, content} = req.body;
  let {tag} = req.body;
  const {storyIdx} = req.params;

  if (!(title || content || tag || req.files.length < 1)) return res.send(errResponse(baseResponse.UPDATE_INFO_EMPTY));

  if (req.files.length > 3) return res.send(errResponse(baseResponse.EXCEED_IMAGE_QUANTITY));

  if (title && title.length > 100) return res.send(errResponse(baseResponse.EXCEED_STORY_TITLE));
  if (content && content.length > 2000) return res.send(errResponse(baseResponse.EXCEED_STORY_CONTENT));
  if (tag && Array.isArray(tag) && tag.length > 3) return res.send(errResponse(baseResponse.EXCEED_STORY_TAG));
  if (tag && Array.isArray(tag)){
    tag.map(item => {
      if (item.length > 20) return res.send(errResponse(baseResponse.EXCEED_TAG_LENGTH));
    })
  }
  if (tag && typeof tag == 'string'){
    if (tag.length > 20) return res.send(errResponse(baseResponse.EXCEED_TAG_LENGTH));
    tag = [tag];
  }

  const imageArr = req.files.map(item => item.location);

  const updateStory = await storyService.updateStory(storyIdx, userIdx, title, content, tag, imageArr);

  return res.send(updateStory);
}

/*
  API No. 5.13
  API Name: 스토리 신고 API
  [POST] /with/stories/:storyIdx/reported
  body: reportedReasonIdx, etcReason
*/
exports.reportStory = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {storyIdx} = req.params;
  const {reportedReasonIdx, etcReason} = req.body;

  if (!reportedReasonIdx) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (reportedReasonIdx < 1 || reportedReasonIdx > 7) return res.send(errResponse(baseResponse.INVALID_REPORTED_REASON_IDX));

  //직접입력 시 사유가 없을 때
  if (reportedReasonIdx == 7 && !etcReason) return res.send(errResponse(baseResponse.IS_EMPTY));

  //직접입력 아닐 시 사유가 있을 때
  if (reportedReasonIdx != 7 && etcReason) return res.send(errResponse(baseResponse.SELECT_ANOTHER_ETC_REASON_IDX));

  //직접입력 시 글자수 초과
  if (etcReason && etcReason.length > 150) return res.send(errResponse(baseResponse.EXCEED_REPORTED_REASON));

  const reportStory = await storyService.reportStory(userIdx, storyIdx, reportedReasonIdx, etcReason);
  return res.send(reportStory);
}