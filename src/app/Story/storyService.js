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
      
      tag.forEach(async tag => {
        await storyDao.createStoryTag(connection, storyIdx, tag);
      });

      imageArr.forEach(async imageUrl => {
        await storyDao.createStoryImage(connection, storyIdx, imageUrl);
      })

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS);
      
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