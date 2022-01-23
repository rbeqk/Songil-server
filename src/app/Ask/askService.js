const askDao = require('./askDao');
const craftDao = require('../Craft/craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.createCraftAsk = async (userIdx, craftIdx, content) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 상품인지 확인
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      //1:1 문의 작성
      await connection.beginTransaction();
      await askDao.createCraftAsk(connection, userIdx, craftIdx, content);
      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createCraftAsk DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createCraftAsk DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}