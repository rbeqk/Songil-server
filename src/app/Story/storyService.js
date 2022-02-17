const storyDao = require('./storyDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {CATEGORY} = require('../../../modules/constants');

exports.createStory = async (userIdx, title, content, tag, imageArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      await connection.beginTransaction();

      const createStoryInfo = await storyDao.createStoryInfo(connection, userIdx, title, content);
      const storyIdx = createStoryInfo.insertId;
      
      if (tag){
        tag.forEach(async tag => {
          await storyDao.createStoryTag(connection, storyIdx, tag);
        });
      }

      imageArr.forEach(async imageUrl => {
        await storyDao.createStoryImage(connection, storyIdx, imageUrl);
      })

      const result = {
        'storyIdx': storyIdx
      };

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createStory DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createStory DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//스토리 삭제
exports.deleteStory = async (userIdx, storyIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 스토리인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_IDX);
      }

      //스토리의 userIdx 가져오기
      const storyUserIdx = await storyDao.getStoryUserIdx(connection, storyIdx);
      if (storyUserIdx !== userIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }
      
      await connection.beginTransaction();
      await storyDao.deleteStory(connection, storyIdx);
      await storyDao.deleteStoryTag(connection, storyIdx);
      await storyDao.deleteStoryImage(connection, storyIdx);
      await storyDao.deleteStoryLike(connection, storyIdx);
      await storyDao.deleteStoryComment(connection, storyIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteStory DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteStory DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//스토리 수정
exports.updateStory = async (storyIdx, userIdx, title, content, tag, imageArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 스토리인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_IDX);
      }

      //스토리의 userIdx 가져오기
      const storyUserIdx = await storyDao.getStoryUserIdx(connection, storyIdx);
      if (storyUserIdx !== userIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }
      
      await connection.beginTransaction();
      
      //스토리 기본 정보 수정하기
      if (title || content){
        await storyDao.updateStoryInfo(connection, storyIdx, title, content);
      }

      //스토리 태그 수정하기
      if (tag){

        //스토리 태그 삭제
        await storyDao.deleteStoryTag(connection, storyIdx);

        //스토리 태그 등록
        tag.forEach(async item => {
          await storyDao.createStoryTag(connection, storyIdx, item);
        });
      }

      //스토리 사진 수정하기
      if (imageArr.length > 0){

        //스토리 사진 삭제
        await storyDao.deleteStoryImage(connection, storyIdx);

        //스토리 사진 등록
        imageArr.forEach(async item => {
          await storyDao.createStoryImage(connection, storyIdx, item);
        });
      }

      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`updateStory DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`updateStory DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//스토리 신고
exports.reportStory = async (userIdx, storyIdx, reportedReasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 스토리인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_IDX);
      }

      //기존에 신고한 스토리인지
      const isAlreadyReportedStory = await storyDao.isAlreadyReportedStory(connection, userIdx, storyIdx, CATEGORY.STORY);
      if (isAlreadyReportedStory){
        connection.release();
        return errResponse(baseResponse.ALREADY_REPORTED_IDX);
      }

      //자기 스토리인지
      const isUserStory = await storyDao.isUserStory(connection, userIdx, storyIdx);
      if (isUserStory){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_REPORT_SELF);
      }

      await connection.beginTransaction();
      await storyDao.reportStory(connection, userIdx, storyIdx, CATEGORY.STORY, reportedReasonIdx, etcReason);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reportStory DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reportStory DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}