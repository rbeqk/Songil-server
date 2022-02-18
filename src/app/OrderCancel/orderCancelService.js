const orderCancelDao = require('./orderCancelDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ORDER_STATUS} = require('../../../modules/constants');

//주문취소 요청
exports.reqOrderCraftCancel = async (userIdx, orderCraftIdx, reasonIdx, etcReason) => {
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

      const canCancelOrderCraft = await orderCancelDao.canCancelOrderCraft(connection, orderCraftIdx);
      if (!canCancelOrderCraft){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_CANCEL_STATUS);
      }

      await connection.beginTransaction();
      await orderCancelDao.reqOrderCraftCancel(connection, orderCraftIdx, reasonIdx, etcReason);
      await orderCancelDao.updateOrderCraftStatus(connection, orderCraftIdx, ORDER_STATUS.REQUEST_CANCEL);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reqOrderCraftCancel DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reqOrderCraftCancel DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}