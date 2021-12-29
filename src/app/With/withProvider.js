const withDao = require('./withDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

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

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (totalCnt % pageItemCnt == 0) ? totalCnt / pageItemCnt : parseInt(totalCnt / pageItemCnt) + 1;  //총 페이지 수

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

      //로그인하지 않았을 시 유효하지 않는 userIdx로 변경
      if (!userIdx) userIdx = -1;

      let result;
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const startItemIdx = (page - 1) * pageItemCnt;

      if (category === 'story'){
        result = {};
        result.totalCnt = await withDao.getStoryTotalCnt(connection);
        
        result.story = [];
        const story = await withDao.getStory(connection, userIdx, sort, startItemIdx, pageItemCnt);

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

        const qna = await withDao.getQnA(connection, userIdx, sort, startItemIdx, pageItemCnt);

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