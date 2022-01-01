const abTestService = require('./abTestService');
const abTestProvider = require('./abTestProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const {getUserIdx} = require('../../../config/userInfo');
const moment = require('moment');

/*
  API No. 5.8
  API Name: ABTest 상세 조회 API
  [GET] /with/ab-test/:abTestIdx
*/
exports.getABTestDetail = async (req, res) => {
  const {abTestIdx} = req.params;
  const token = req.headers['x-access-token'];

  const userIdx = getUserIdx(token);
  if (userIdx === false) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));

  const getABTestDetail = await abTestProvider.getABTestDetail(abTestIdx, userIdx);

  return res.send(getABTestDetail);
}

/*
  API No. 5.12
  API Name: ABTest 등록 API
  [POST] /with/ab-test
  body: content, year, month, day, image
*/
exports.createABTest = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {content, year, month, day} = req.body;

  if (!(content && year && month && day)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (content.length > 3000) return res.send(errResponse(baseResponse.EXCEED_ABTEST_CONTENT));

  if (month < 1 || month > 12) return res.send(errResponse(baseResponse.EXCEED_DATE));

  if ([1, 3, 5, 7, 8, 10, 12].includes(year)){
    if (day < 1 ||  day > 31) return res.send(errResponse(baseResponse.EXCEED_DATE));
  }
  else{
    if (day < 1 || day > 30) return res.send(errResponse(baseResponse.EXCEED_DATE));
  }

  const imageArr = req.files.map(item => item.location);
  if (imageArr.length != 2) return res.send(errResponse(baseResponse.INVALID_IMAGE_QUANTITY));

  let deadline = new Date(`${year}/${month}/${day} 23:59:59`);
  const now = moment();

  if (deadline < now) return res.send(errResponse(baseResponse.EXCEED_DATE));
  deadline = moment(deadline).format('YYYY-MM-DD HH:mm:ss');

  const createABTest = await abTestService.createABTest(userIdx, content, deadline, imageArr);

  return res.send(createABTest);
}

/*
  API No. 5.22
  API Name: ABTest 삭제 API
  [DELETE] /with/ab-test/:abTestIdx
*/
exports.deleteABTest = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {abTestIdx} = req.params;

  const deleteABTest = await abTestService.deleteABTest(userIdx, abTestIdx);

  return res.send(deleteABTest);
}

/*
  API No. 5.26
  API Name: ABTest 투표 API
  [POST] /with/ab-test/:abTestIdx/vote
  body: image
*/
exports.voteABTest = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {abTestIdx} = req.params;
  const {vote} = req.body;

  if (!vote) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (!['A', 'B'].includes(vote)) return res.send(errResponse(baseResponse.INVALID_VOTE_NAME));

  const voteABTest = await abTestService.voteABTest(userIdx, abTestIdx, vote);

  return res.send(voteABTest);
}

/*
  API No. 5.27
  API Name: ABTest 투표 취소 API
  [DELETE] /with/ab-test/:abTestIdx/vote
*/
exports.deleteVoteABTest = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {abTestIdx} = req.params;
  
  const deleteVoteABTest = await abTestService.deleteVoteABTest(userIdx, abTestIdx);

  return res.send(deleteVoteABTest);
}