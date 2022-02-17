const artistPageDao = require('./artistPageDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//주문자 정보 확인
exports.getOrderCraftUserInfo = async (userIdx, orderCraftIdx) => {
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
      const isArtistOrderCraftIdx = await artistPageDao.isArtistOrderCraftIdx(connection, artistIdx, orderCraftIdx);
      if (!isArtistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const info = await artistPageDao.getOrderCraftUserInfo(connection, orderCraftIdx);

      connection.release();
      return response(baseResponse.SUCCESS, info);

    }catch(err){
      connection.release();
      logger.error(`getOrderCraftUserInfo DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getOrderCraftUserInfo DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}