const qnaProvider = require('./qnaProvider');
const qnaService = require('./qnaService');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const jwt = require("jsonwebtoken");

require('dotenv').config();

/*
  API No. 5.6
  API Name: QnA 상세 조회 API
  [GET] /with/qna/:qanIdx
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

/*
  API No. 5.11
  API Name: QnA 등록 API
  [POST] /with/qna
*/
exports.createQnA = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {title, content} = req.body;

  if (!(title && content)) return res.send(errResponse(baseResponse.IS_EMPTY));
  if (title.length > 300) return res.send(errResponse(baseResponse.EXCEED_QNA_TITLE));
  if (content.length > 3000) return res.send(errResponse(baseResponse.EXCEED_QNA_CONTENT));

  const createQnA = await qnaService.createQnA(userIdx, title, content);

  return res.send(createQnA);
}