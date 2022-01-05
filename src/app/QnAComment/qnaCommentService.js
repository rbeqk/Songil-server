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

//QnA 댓글 삭제
exports.deleteQnAComment = async (userIdx, qnaCommentIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 QnA 댓글 idx인지
      const isExistSQnACommentIdx = await qnaCommentDao.isExistSQnACommentIdx(connection, qnaCommentIdx);
      if (!isExistSQnACommentIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_QNA_COMMENT_IDX);
      }

      //QnA 댓글의 userIdx 가져오기
      const qnaCommentUserIdx = await qnaCommentDao.getQnACommentUserIdx(connection, qnaCommentIdx);
      if (userIdx !== qnaCommentUserIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      await connection.beginTransaction();
      await qnaCommentDao.deleteStoryComment(connection, qnaCommentIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteQnAComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteQnAComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//QnA 댓글 신고
exports.reportQnAComment = async (qnaCommentIdx, userIdx, reportedCommentReasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 QnA 댓글 idx인지
      const isExistSQnACommentIdx = await qnaCommentDao.isExistSQnACommentIdx(connection, qnaCommentIdx);
      if (!isExistSQnACommentIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_QNA_COMMENT_IDX);
      }

      //사용자가 기존에 신고한 QnA 댓글 idx인지
      const isExistUserReportedCommentIdx = await qnaCommentDao.isExistUserReportedCommentIdx(connection, userIdx, qnaCommentIdx);
      if (isExistUserReportedCommentIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_REPORTED_COMMENT_IDX);
      }

      //자기 댓글인지
      const isUserQnAComment = await qnaCommentDao.isUserQnAComment(connection, userIdx, qnaCommentIdx);
      if (isUserQnAComment){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_REPORT_SELF);
      }

      await connection.beginTransaction();
      await qnaCommentDao.reportQnAComment(connection, qnaCommentIdx, userIdx, reportedCommentReasonIdx, etcReason);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reportQnAComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reportQnAComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}