const storyDao = require('./storyDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

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
      if (!isExistStoryIdx) return errResponse(baseResponse.INVALID_ABTEST_IDX);

      //스토리의 userIdx 가져오기
      const storyUserIdx = await storyDao.getStoryUserIdx(connection, storyIdx);
      if (storyUserIdx !== userIdx) return errResponse(baseResponse.NO_PERMISSION);
      
      await connection.beginTransaction();
      await storyDao.deleteStory(connection, storyIdx);
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