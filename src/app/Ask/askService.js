const askDao = require('./askDao');
const craftDao = require('../Craft/craftDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//1:1 문의하기 작성
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

//주문현황 문의하기 작성
exports.createDeliveryAsk = async (userIdx, orderCraftIdx, content) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const isExistOrderCraftIdx = await orderStatusDao.isExistOrderCraftIdx(connection, orderCraftIdx);
      if (!isExistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_CRAFT_IDX);
      }

      const isUserOrderOrderCraftIdx = await orderStatusDao.isUserOrderOrderCraftIdx(connection, userIdx, orderCraftIdx);
      if (!isUserOrderOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      await connection.beginTransaction();
      const createDeliveryAsk = await askDao.createDeliveryAsk(connection, userIdx, orderCraftIdx, content);
      await connection.commit();

      const askIdx = createDeliveryAsk.insertId;
      const result = {
        'askIdx': askIdx
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createDeliveryAsk DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createDeliveryAsk DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}