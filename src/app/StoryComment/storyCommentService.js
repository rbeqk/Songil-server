const storyCommentDao = require('./storyCommentDao');
const storyDao = require('../Story/storyDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {STORY} = require('../../../modules/constants');

exports.createStoryComment = async (userIdx, storyIdx, parentIdx, comment) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 storyIdx인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_IDX);
      }

      //존재하는 parentIdx인지(= 존재하는 storyCommentIdx인지 && parentIdx IS NULL)
      if (parentIdx){
        const isExistStoryCommentParentIdx = await storyCommentDao.isExistStoryCommentParentIdx(connection, parentIdx);
        if (!isExistStoryCommentParentIdx){
          connection.release();
          return errResponse(baseResponse.INVALID_PARENT_IDX);
        }
      }
      
      if (!parentIdx) parentIdx = null;

      await connection.beginTransaction();
      await storyCommentDao.createStoryComment(connection, storyIdx, userIdx, parentIdx, comment);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createStoryComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createStoryComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//스토리 댓글 삭제
exports.deleteStoryComment = async (userIdx, storyCommentIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 스토리 댓글 idx인지
      const isExistStoryCommentIdx = await storyCommentDao.isExistStoryCommentIdx(connection, storyCommentIdx);
      if (!isExistStoryCommentIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_COMMENT_IDX);
      }

      //스토리 댓글의 userIdx 가져오기
      const storyCommentUserIdx = await storyCommentDao.getStoryCommentUserIdx(connection, storyCommentIdx);
      if (userIdx !== storyCommentUserIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      await connection.beginTransaction();
      await storyCommentDao.deleteStoryComment(connection, storyCommentIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteStoryComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteStoryComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//스토리 댓글 신고
exports.reportStoryComment = async (storyCommentIdx, userIdx, reportedReasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 스토리 댓글 idx인지
      const isExistStoryCommentIdx = await storyCommentDao.isExistStoryCommentIdx(connection, storyCommentIdx);
      if (!isExistStoryCommentIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_COMMENT_IDX);
      }

      //사용자가 기존에 신고한 스토리 댓글 idx인지
      const isAlreadyReportedStoryCommentIdx = await storyCommentDao.isAlreadyReportedStoryCommentIdx(connection, userIdx, storyCommentIdx, STORY);
      if (isAlreadyReportedStoryCommentIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_REPORTED_IDX);
      }

      //자기 댓글인지
      const isUserStoryComment = await storyCommentDao.isUserStoryComment(connection, userIdx, storyCommentIdx);
      if (isUserStoryComment){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_REPORT_SELF);
      }

      await connection.beginTransaction();
      await storyCommentDao.reportStoryComment(connection, storyCommentIdx, userIdx, reportedReasonIdx, etcReason, STORY);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reportStoryComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reportStoryComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}