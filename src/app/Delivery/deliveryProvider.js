const deliveryDao = require('./deliveryDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

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