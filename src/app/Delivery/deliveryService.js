const deliveryDao = require('./deliveryDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const axios = require('axios');
const {ORDER_STATUS, DELIVERY_STATUS} = require('../../../modules/constants');
require('dotenv').config();

//발송정보 입력
exports.createSendingInfo = async (userIdx, orderCraftIdx, sentAt, tCode, tInvoice) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistOrderCraftIdx = await deliveryDao.isExistOrderCraftIdx(connection, orderCraftIdx);
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

      const isArtistOrderCraftIdx = await deliveryDao.isArtistOrderCraftIdx(connection, artistIdx, orderCraftIdx);
      if (!isArtistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const canCreateSendingInfo = await deliveryDao.canCreateSendingInfo(connection, orderCraftIdx);
      if (!canCreateSendingInfo){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_CREATE_SENDING_INFO);
      }

      const isValidTInvoice = await axios.get('https://info.sweettracker.co.kr/api/v1/trackingInfo', {
        params: {
          t_key: process.env.SWEET_TRACKER_KEY,
          t_code: tCode,
          t_invoice: tInvoice
        }
      })

      if (isValidTInvoice.data?.code == 104){
        return errResponse(baseResponse.INVALID_TINVOICE);
      }
      else if (isValidTInvoice.data?.code){
        logger.error(isValidTInvoice.data.msg);
        return errResponse(baseResponse.SERVER_ERROR);
      }

      await connection.beginTransaction();
      await deliveryDao.createSendingInfo(connection, orderCraftIdx, sentAt, tCode, tInvoice);
      await deliveryDao.updateOrderCraftStatus(
        connection, orderCraftIdx, ORDER_STATUS.BEING_DELIVERIED, DELIVERY_STATUS.BEING_DELIVERIED
      );
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createSendingInfo DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createSendingInfo DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}