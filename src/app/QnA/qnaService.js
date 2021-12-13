const qnaDao = require('./qnaDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');


exports.createQnA = async (userIdx, title, content) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      await connection.beginTransaction();
      await qnaDao.createQnA(connection, userIdx, title, content);

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createQnA DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createQnA DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}