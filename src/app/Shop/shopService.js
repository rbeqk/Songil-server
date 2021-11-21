const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.createProductAsk = async (params) => {
  //params = [userIdx, productIdx, content]

  const userIdx = params[0];
  const productIdx = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 소비자인지 확인
      const isConsumerIdx = await shopDao.isExistConsumerIdx(connection, userIdx);
      if (!isConsumerIdx) return errResponse(baseResponse.INVALID_CONSUMER_IDX);

      //존재하는 상품인지 확인
      const isExistProductIdx = await shopDao.isExistProductIdx(connection, productIdx);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);

      //1:1 문의 작성
      await connection.beginTransaction();
      await shopDao.createProductAsk(connection, params);
      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS);
      
    }catch(err){
      connection.release();
      logger.error(`createProductAsk DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createProductAsk DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}