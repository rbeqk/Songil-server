const myPageDao = require('./myPageDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getMyCommentTotalPage = async (userIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let totalCommentCnt;

      //작성 가능한 코멘트 페이지 수
      if (type === 'available'){
        //totalCommentCnt = await myPageDao.getTotalAvailableCommentCnt(connection, userIdx); //TODO
        totalCommentCnt = 0;  //임시
      }
      //작성한 코멘트 페이지 수
      else if (type === 'written'){
        totalCommentCnt = await myPageDao.getTotalWrittenCommentCnt(connection, userIdx);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (totalCommentCnt % pageItemCnt == 0) ? totalCommentCnt / pageItemCnt : parseInt(totalCommentCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {
        'totalPages': totalPages
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getMyCommentTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getMyCommentTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}