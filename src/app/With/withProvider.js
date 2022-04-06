const withDao = require('./withDao');
const homeDao = require('../Home/homeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getABTestFinalInfo, getUserVoteInfo} = require('../../../modules/abTestUtil');
const {pageInfo, getTotalPage} = require("../../../modules/pageUtil");
const {ITEMS_PER_PAGE} = require("../../../modules/constants");

exports.getHotTalk = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const hotTalk = await homeDao.getTalkWith(connection);

      let result = [];

      hotTalk.forEach(item => {
        result.push({
          'idx': item.idx,
          'categoryIdx': item.categoryIdx,
          'text': item.text,
          'imageUrl': item.imageUrl,
          'totalCommentCnt': item.totalCommentCnt
        })
      });

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
exports.getTotalWithPage = async (userIdx, category) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const blockUsers = await withDao.getBlockUsers(connection, userIdx);
      let totalCnt;

      if (category === 'story'){
        totalCnt = await withDao.getStoryTotalCnt(connection, blockUsers);
      }
      else if (category === 'qna'){
        totalCnt = await withDao.getQnaTotalCnt(connection, blockUsers);
      }
      else if (category === 'ab-test'){
        totalCnt = await withDao.getABTestTotalCnt(connection, blockUsers);
      }

      const totalPages = getTotalPage(totalCnt, ITEMS_PER_PAGE.WITH_BY_CATEGORY_PER_PAGE);
      const result = new pageInfo(totalPages, ITEMS_PER_PAGE.WITH_BY_CATEGORY_PER_PAGE);

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
      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.WITH_BY_CATEGORY_PER_PAGE;
      const blockUsers = await withDao.getBlockUsers(connection, userIdx);

      if (category === 'story'){
        result = {};
        result.totalCnt = await withDao.getStoryTotalCnt(connection, blockUsers);
        
        result.story = [];
        const story = await withDao.getStory(
          connection, userIdx, blockUsers, sort, startItemIdx, ITEMS_PER_PAGE.WITH_BY_CATEGORY_PER_PAGE
        );

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
        });

        result.story.reverse();
      }
      else if (category === 'qna'){
        result = [];

        const qna = await withDao.getQnA(
          connection, userIdx, blockUsers, sort, startItemIdx, ITEMS_PER_PAGE.WITH_BY_CATEGORY_PER_PAGE
        );

        qna.forEach(item => {
          result.push({
            'qnaIdx': item.qnaIdx,
            'userIdx': item.userIdx,
            'userProfile': item.userProfile,
            'userName': item.userName,
            'title': item.title,
            'content': item.content,
            'createdAt': item.createdAt,
            'isUserQnA': item.isUserQnA,
            'totalLikeCnt': item.totalLikeCnt,
            'isLike': item.isLike,
            'totalCommentCnt': item.totalCommentCnt
          })
        });

        result.reverse();

      }
      else if (category === 'ab-test'){
        result = [];
        const abTest = await withDao.getABTest(
          connection, blockUsers, startItemIdx, ITEMS_PER_PAGE.WITH_BY_CATEGORY_PER_PAGE
        );

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
            'artistName': item.artistName,
            'content': item.content,
            'imageA': item.imageA,
            'imageB': item.imageB,
            'deadline': item.deadline,
            'totalCommentCnt': item.totalCommentCnt,
            'isFinished': item.isFinished,
            'isUserABTest': item.isUserABTest,
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
      logger.error(`getWith DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getWith DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}