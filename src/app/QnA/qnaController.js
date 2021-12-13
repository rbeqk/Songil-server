const qnaProvider = require('./qnaProvider');
const qnaService = require('./qnaService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 5.7
  API Name: QnA 상세 조회 API
  [PATCH] /with/qna/:qanIdx
*/
exports.getQnADetail = async (req, res) => {
  const {qnaIdx} = req.params;
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

  const getQnADetail = await qnaProvider.getQnADetail(qnaIdx, userIdx);

  return res.send(getQnADetail);
}