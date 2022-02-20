const deliveryDao = require('./deliveryDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const axios = require('axios');
require('dotenv').config();

//발송정보 조회
exports.getSendingInfo = async (userIdx, orderCraftIdx) => {
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

      let result;
      const isEnteredDeliveryInfo = await deliveryDao.isEnteredDeliveryInfo(connection, orderCraftIdx);

      if (!isEnteredDeliveryInfo){
        result = null;
      }
      else{
        const deliveryInfo = await deliveryDao.getSendingInfo(connection, orderCraftIdx);
        result = {
          'year': deliveryInfo.year,
          'month': deliveryInfo.month,
          'day': deliveryInfo.day,
          'tCode': deliveryInfo.tCode,
          'tInvoice': deliveryInfo.tInvoice
        }
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getSendingInfo DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getSendingInfo DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//배송 현황 조회
exports.getTrackingInfo = async (userIdx, orderCraftIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistOrderCraftIdx = await deliveryDao.isExistOrderCraftIdx(connection, orderCraftIdx);
      if (!isExistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_CRAFT_IDX);
      }

      const isUserOrderCraftIdx = await deliveryDao.isUserOrderCraftIdx(connection, userIdx, orderCraftIdx);
      if (!isUserOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const isEnteredDeliveryInfo = await deliveryDao.isEnteredDeliveryInfo(connection, orderCraftIdx);
      if (!isEnteredDeliveryInfo){
        return errResponse(baseResponse.NOT_ENTER_DELIVERY_INFO);
      }

      const trackingInfo = await deliveryDao.getTrackingInfo(connection, orderCraftIdx);
      let result = [];

      trackingInfo.forEach(item => {
        result.push({
          'time': [item.date, item.timeString],
          'where': item.location,
          'kind': item.kind
        });
      });

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getTrackingInfo DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getTrackingInfo DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}