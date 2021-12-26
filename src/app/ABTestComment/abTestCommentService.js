const abTestCommentDao = require('./abTestCommentDao');
const abTestDao = require('../ABTest/abTestDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.createABTestComment = async (userIdx, abTestIdx, parentIdx, comment) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //존재하는 parentIdx인지(= 존재하는 abTestCommentIdx인지 && parentIdx IS NULL)
      if (parentIdx){
        const isExistABTestCommentParentIdx = await abTestCommentDao.isExistABTestCommentParentIdx(connection, parentIdx);
        if (!isExistABTestCommentParentIdx){
          connection.release();
          return errResponse(baseResponse.INVALID_PARENT_IDX);
        }
      }
      
      if (!parentIdx){
        parentIdx = null; //없을 경우 null로 변경
      }

      await connection.beginTransaction();
      await abTestCommentDao.createABTestComment(connection, abTestIdx, userIdx, parentIdx, comment);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createABTestComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createABTestComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//ABTest 댓글 삭제
exports.deleteABTestComment = async (userIdx, abTestCommentIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 abTest 댓글 idx인지
      const isExistABTestCommentIdx = await abTestCommentDao.isExistABTestCommentIdx(connection, abTestCommentIdx);
      if (!isExistABTestCommentIdx) return errResponse(baseResponse.INVALID_ABTEST_COMMENT_IDX);

      //abTest 댓글의 userIdx 가져오기
      const abTestCommentUserIdx = await abTestCommentDao.getABTestommentUserIdx(connection, abTestCommentIdx);
      if (userIdx !== abTestCommentUserIdx) return errResponse(baseResponse.NO_PERMISSION);

      await connection.beginTransaction();
      await abTestCommentDao.deleteABTestomment(connection, abTestCommentIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteABTestComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteABTestComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}