const orderCancelDao = require('./orderCancelDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ORDER_STATUS, RES_STATUS, BOOTPAY_RETURN_TYPE} = require('../../../modules/constants');
const { bootPayRefund } = require('../../../modules/refundUtil');

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

//주문취소 거부 시 => 주문현황은 배송준바중으로
async function orderCraftCancelRejection(connection, orderCraftIdx){
  const resStatusIdx = RES_STATUS.REJECTION;
  const orderStatusIdx = ORDER_STATUS.READY_FOR_DELIVERY;

  await connection.beginTransaction();
  await orderCancelDao.resOrderCraftCancel(connection, orderCraftIdx, resStatusIdx);
  await orderCancelDao.updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx);
  await connection.commit();
}

//주문취소 승인 시
async function orderCraftCancelApproval(connection, orderCraftIdx){
  const refundInfo = await orderCancelDao.getCancelInfo(connection, orderCraftIdx);
  const result = await bootPayRefund(connection, orderCraftIdx, BOOTPAY_RETURN_TYPE.CANCEL, refundInfo);
  return result;
}

//주문취소 승인 및 거부
exports.resOrderCraftCancel = async (userIdx, orderCraftIdx, type) => {
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
      const isArtistOrderCraft = await orderCancelDao.isArtistOrderCraft(connection, artistIdx, orderCraftIdx);
      if (!isArtistOrderCraft){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const canResCancelOrderCraft = await orderCancelDao.canResCancelOrderCraft(connection, orderCraftIdx, type);
      if (!canResCancelOrderCraft){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_CANCEL_STATUS);
      }

      //주문취소 거부 시
      if (type === 'rejection'){
        await orderCraftCancelRejection(connection, orderCraftIdx);
      }
      //주문 취소 승인 시
      else if (type === 'approval'){
        const result = await orderCraftCancelApproval(connection, orderCraftIdx);
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
      logger.error(`resOrderCraftCancel DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`resOrderCraftCancel DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}