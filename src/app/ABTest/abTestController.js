const abTestService = require('./abTestService');
const abTestProvider = require('./abTestProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 5.8
  API Name: ABTest 상세 조회 API
  [GET] /with/ab-test/:abTestIdx
*/
exports.getABTestDetail = async (req, res) => {
  const {abTestIdx} = req.params;
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

  const getABTestDetail = await abTestProvider.getABTestDetail(abTestIdx, userIdx);

  return res.send(getABTestDetail);
}