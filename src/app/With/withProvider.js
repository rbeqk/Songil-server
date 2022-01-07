const withDao = require('./withDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getABTestFinalInfo, getUserVoteInfo} = require('../../../modules/abTestUtil');
const {getTotalPage} = require("../../../modules/pageUtil");

const WITH_BY_CATEGORY_PER_PAGE = 5;

exports.getHotTalk = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const getHotTalk = await withDao.getHotTalk(connection);

      let result = [];

      if (getHotTalk.length){
        getHotTalk.forEach(item => {
          result.push({
            'idx': item.idx,
            'categoryIdx': item.categoryIdx,
            'text': item.text,
            'imageUrl': item.imageUrl,
            'totalCommentCnt': item.totalCommentCnt
          })
        })
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getHotTalk DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getHotTalk DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//카테고리 별 WITH 페이지 개수 조회
exports.getTotalWithPage = async (category) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let totalCnt;

      if (category === 'story'){
        totalCnt = await withDao.getStoryTotalCnt(connection);
      }
      else if (category === 'qna'){
        totalCnt = await withDao.getQnaTotalCnt(connection);
      }
      else if (category === 'ab-test'){
        totalCnt = await withDao.getABTestTotalCnt(connection);
      }

      const totalPages = getTotalPage(totalCnt, WITH_BY_CATEGORY_PER_PAGE);

      const result = {
        'totalPages': totalPages
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getTotalWithPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getTotalWithPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//카테고리 별 WITH 가져오기
exports.getWith = async (category, sort, page, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let result;
      const startItemIdx = (page - 1) * WITH_BY_CATEGORY_PER_PAGE;

      if (category === 'story'){
        result = {};
        result.totalCnt = await withDao.getStoryTotalCnt(connection);
        
        result.story = [];
        const story = await withDao.getStory(connection, userIdx, sort, startItemIdx, WITH_BY_CATEGORY_PER_PAGE);

        if (story.length > 0){
          story.forEach(item => {
            result.story.push({
              'storyIdx': item.storyIdx,
              'mainImageUrl': item.mainImageUrl,
              'title': item.title,
              'userIdx': item.userIdx,
              'userName': item.userName,
              'totalLikeCnt': item.totalLikeCnt,
              'isLike': item.isLike
            })
          })
        }

        result.story.reverse();
      }
      else if (category === 'qna'){
        result = [];

        const qna = await withDao.getQnA(connection, userIdx, sort, startItemIdx, WITH_BY_CATEGORY_PER_PAGE);

        if (qna.length > 0){
          qna.forEach(item => {
            result.push({
              'qnaIdx': item.qnaIdx,
              'title': item.title,
              'content': item.content,
              'createdAt': item.createdAt,
              'userIdx': item.userIdx,
              'userName': item.userName,
              'totalLikeCnt': item.totalLikeCnt,
              'isLike': item.isLike
            })
          })
        }

        result.reverse();

      }
      else if (category === 'ab-test'){
        result = [];
        const abTest = await withDao.getABTest(connection, startItemIdx, WITH_BY_CATEGORY_PER_PAGE);

        for (let item of abTest){

          //투표 결과 가져오기
          let finalInfo = null;
          if (item.isFinished === 'Y'){
            finalInfo = await getABTestFinalInfo(connection, item.abTestIdx);
            if (finalInfo === false){
              connection.release();
              return errResponse(baseResponse.DB_ERROR);
            }
          }
          
          //유저의 투표 정보 가져오기
          let voteInfo = null;
          if (userIdx != -1){
            voteInfo = await getUserVoteInfo(connection, userIdx, item.abTestIdx);
            if (voteInfo === false){
              connection.release();
              return errResponse(baseResponse.DB_ERROR);
            }
          }
          
          result.push({
            'abTestIdx': item.abTestIdx,
            'artistIdx': item.artistIdx,
            'artistImageUrl': item.artistImageUrl,
            'content': item.content,
            'imageA': item.imageA,
            'imageB': item.imageB,
            'deadline': item.deadline,
            'isFinished': item.isFinished,
            'totalCommentCnt': item.totalCommentCnt,
            'voteInfo': voteInfo,
            'finalInfo': finalInfo
          });
        }

        result.reverse();
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getTotalWithPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getTotalWithPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}