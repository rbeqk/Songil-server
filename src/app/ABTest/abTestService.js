const abTestDao = require('./abTestDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ABTEST} = require('../../../modules/constants');

exports.createABTest = async (userIdx, content, deadline, imageArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //작가의 userIdx인지
      const isArtistUserIdx = await abTestDao.isArtistUserIdx(connection, userIdx);
      if (!isArtistUserIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //작가idx 가져오기
      const artistIdx = await abTestDao.getArtistIdx(connection, userIdx);
      
      await connection.beginTransaction();
      await abTestDao.createABTest(connection, content, deadline, imageArr, artistIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//abTest 삭제
exports.deleteABTest = async (userIdx, abTestIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //abTest 작가의 userIdx 가져오기
      const abTestUserIdx = await abTestDao.getAbTestUserIdx(connection, abTestIdx);
      if (abTestUserIdx !== userIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }
      
      await connection.beginTransaction();
      await abTestDao.deleteABTest(connection, abTestIdx);
      await abTestDao.deleteABTestComment(connection, abTestIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//abTest 투표
exports.voteABTest = async (userIdx, abTestIdx, vote) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //투표 마감된 ABTest인지
      const isFinishedAbTest = await abTestDao.isFinishedAbTest(connection, abTestIdx);
      if (isFinishedAbTest){
        connection.release();
        return errResponse(baseResponse.ALREADY_FINISHED_ABTEST_IDX);
      }

      //기존에 투표한 ABTest인지
      const isExistVoteResult = await abTestDao.isExistVoteResult(connection, userIdx, abTestIdx);
      if (isExistVoteResult){
        connection.release();
        return errResponse(baseResponse.ALREADY_VOTE_ABTEST_IDX);
      }

      await connection.beginTransaction();
      await abTestDao.voteABTest(connection, userIdx, abTestIdx, vote);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`voteABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`voteABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//abTest 투표 취소
exports.deleteVoteABTest = async (userIdx, abTestIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //투표 마감된 ABTest인지
      const isFinishedAbTest = await abTestDao.isFinishedAbTest(connection, abTestIdx);
      if (isFinishedAbTest){
        connection.release();
        return errResponse(baseResponse.ALREADY_FINISHED_ABTEST_IDX);
      }

      //기존에 투표한 ABTest인지
      const isExistVoteResult = await abTestDao.isExistVoteResult(connection, userIdx, abTestIdx);
      if (!isExistVoteResult){
        connection.release();
        return errResponse(baseResponse.NO_VOTE_DATA);
      }

      await connection.beginTransaction();
      await abTestDao.deleteVoteABTest(connection, userIdx, abTestIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteVoteABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteVoteABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//abTest 수정
exports.updateABTest = async (userIdx, abTestIdx, content) => { 
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //abTest 작가의 userIdx 가져오기
      const abTestUserIdx = await abTestDao.getAbTestUserIdx(connection, abTestIdx);
      if (abTestUserIdx !== userIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      await connection.beginTransaction();
      await abTestDao.updateABTest(connection, abTestIdx, content);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`updateABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`updateABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//abTest 신고
exports.reportABTest = async (userIdx, abTestIdx, reportedReasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //기존에 신고한 abTest인지
      const isAlreadyReportedABTest = await abTestDao.isAlreadyReportedABTest(connection, userIdx, abTestIdx, ABTEST);
      if (isAlreadyReportedABTest){
        connection.release();
        return errResponse(baseResponse.ALREADY_REPORTED_IDX);
      }

      //abTest 작가의 userIdx 가져오기
      const abTestUserIdx = await abTestDao.getAbTestUserIdx(connection, abTestIdx);
      if (abTestUserIdx == userIdx){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_REPORT_SELF);
      }

      await connection.beginTransaction();
      await abTestDao.reportABTest(connection, userIdx, abTestIdx, ABTEST, reportedReasonIdx, etcReason);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reportABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reportABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}