const orderReturnDao = require('./orderReturnDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ORDER_STATUS, RES_STATUS} = require('../../../modules/constants');

//반품 요청
exports.reqOrderCraftReturn = async (userIdx, orderCraftIdx, reasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistOrderCraftIdx = await orderStatusDao.isExistOrderCraftIdx(connection, orderCraftIdx);
      if (!isExistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_CRAFT_IDX);
      }

      const isUserOrderCraftIdx = await orderStatusDao.isUserOrderOrderCraftIdx(connection, userIdx, orderCraftIdx);
      if (!isUserOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const canReturnOrderCraft = await orderReturnDao.canReturnOrderCraft(connection, orderCraftIdx);
      if (!canReturnOrderCraft){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_RETURN_STATUS);
      }

      await connection.beginTransaction();
      await orderReturnDao.reqOrderCraftReturn(connection, orderCraftIdx, reasonIdx, etcReason);
      await orderReturnDao.updateOrderCraftStatus(connection, orderCraftIdx, ORDER_STATUS.REQUEST_RETURN);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reqOrderCraftReturn DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reqOrderCraftReturn DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}