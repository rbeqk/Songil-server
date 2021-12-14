const qnaCommentDao = require('./qnaCommentDao');
const qnaDao = require('../QnA/qnaDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.createQnAComment = async (userIdx, qnaIdx, parentIdx, comment) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 qnaIdx인지
      const isExistQnaIdx = await qnaDao.isExistQnaIdx(connection, qnaIdx);
      if (!isExistQnaIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_QNA_IDX);
      }

      //존재하는 parentIdx인지(= 존재하는 qnaCommentIdx인지 && parentIdx IS NULL)
      if (parentIdx){
        const isExistQnACommentParentIdx = await qnaCommentDao.isExistQnACommentParentIdx(connection, parentIdx);
        if (!isExistQnACommentParentIdx){
          connection.release();
          return errResponse(baseResponse.INVALID_PARENT_IDX);
        }
      }
      
      if (!parentIdx){
        parentIdx = null; //없을 경우 null로 변경
      }

      await connection.beginTransaction();
      await qnaCommentDao.createQnAComment(connection, qnaIdx, userIdx, parentIdx, comment);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createQnAComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createQnAComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}