const orderStatusDao = require('./orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getOrderDetail = async (userIdx, orderCraftIdx) => {
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

      const orderDetail = await orderStatusDao.getOrderDetail(connection, orderCraftIdx);

      connection.release();
      return response(baseResponse.SUCCESS, orderDetail);

    }catch(err){
      connection.release();
      logger.error(`getOrderDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getOrderDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}