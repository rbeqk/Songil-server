const orderReturnDao = require('./orderReturnDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ORDER_STATUS, RES_STATUS, BOOTPAY_RETURN_TYPE} = require('../../../modules/constants');
const { bootPayRefund } = require('../../../modules/refundUtil');

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

//반품 거부 시 => 주문현황은 배송완료로
async function orderCraftReturnRejection(connection, orderCraftIdx){
  const resStatusIdx = RES_STATUS.REJECTION;
  const orderStatusIdx = ORDER_STATUS.DELIVERY_COMPLETED;

  await connection.beginTransaction();
  await orderReturnDao.resOrderCraftReturn(connection, orderCraftIdx, resStatusIdx);
  await orderReturnDao.updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx);
  await connection.commit();
}

//반품 승인 시
async function orderCraftReturnApproval(connection, orderCraftIdx){
  const refundInfo = await orderReturnDao.getReturnInfo(connection, orderCraftIdx);
  const result = await bootPayRefund(connection, orderCraftIdx, BOOTPAY_RETURN_TYPE.RETURN, refundInfo);
  return result;
}

//반품 승인 및 거부
exports.resOrderCraftReturn = async (userIdx, orderCraftIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistOrderCraftIdx = await orderStatusDao.isExistOrderCraftIdx(connection, orderCraftIdx);
      if (!isExistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_CRAFT_IDX);
      }

      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);
      const isArtistOrderCraft = await orderReturnDao.isArtistOrderCraft(connection, artistIdx, orderCraftIdx);
      if (!isArtistOrderCraft){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const canResReturnOrderCraft = await orderReturnDao.canResReturnOrderCraft(connection, orderCraftIdx);
      if (!canResReturnOrderCraft){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_RES_RETURN);
      }

      //반품 거부 시
      if (type === 'rejection'){
        await orderCraftReturnRejection(connection, orderCraftIdx);
      }
      //반품 승인 시
      else if (type === 'approval'){
        const result = await orderCraftReturnApproval(connection, orderCraftIdx);
        if (!result[0]){
          connection.release();
          return errResponse({"isSuccess": false, "code": 4001, "message": result[1]});
        }
      }

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`resOrderCraftReturn DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`resOrderCraftReturn DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}