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