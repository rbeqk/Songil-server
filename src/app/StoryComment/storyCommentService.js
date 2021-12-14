const storyCommentDao = require('./storyCommentDao');
const storyDao = require('../Story/storyDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

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

      //존재하는 parentIdx인지(= 존재하는 storyIdx인지)
      if (parentIdx){
        const isExistStoryParentIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
        if (!isExistStoryParentIdx){
          connection.release();
          return errResponse(baseResponse.INVALID_PARENT_IDX);
        }
      }
      
      if (!parentIdx){
        parentIdx = null; //없을 경우 null로 변경
      }

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