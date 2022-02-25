const artistPageDao = require('./artistPageDao');
const artistAskDao = require('../ArtistAsk/artistAskDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {pageInfo, getTotalPage} = require("../../../modules/pageUtil");
const {ITEMS_PER_PAGE} = require('../../../modules/constants');

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

      //결제 상세와 동일
      const orderDetail = await orderStatusDao.getOrderDetail(connection, orderCraftIdx);

      connection.release();
      return response(baseResponse.SUCCESS, orderDetail);

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

//주문 현황 조회 및 반품/취소 요청 현황 페이지 조회
exports.getOrderListPage = async (userIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);
      let result;

      //주문현황 조회
      if (type === 'basic'){
        const totalCnt = await artistPageDao.getBasicOrderListCnt(connection, artistIdx);
        const totalPages = getTotalPage(totalCnt, ITEMS_PER_PAGE.ARTIST_PAGE_ORDER_LIST_PER_PAGE);
        result = new pageInfo(totalPages, ITEMS_PER_PAGE.ARTIST_PAGE_ORDER_LIST_PER_PAGE);
      }
      //반품/취소 요청 현황 조회
      else if (type === 'cancelOrReturn'){
        const totalCnt = await artistPageDao.getCancelOrReturnList(connection, artistIdx);
        const totalPages = getTotalPage(totalCnt, ITEMS_PER_PAGE.ARTIST_PAGE_CANCEL_OR_RETURN_LIST_PER_PAGE);
        result = new pageInfo(totalPages, ITEMS_PER_PAGE.ARTIST_PAGE_CANCEL_OR_RETURN_LIST_PER_PAGE);
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getOrderListPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getOrderListPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//주문 현황 조회 및 반품/취소 요청 현황 조회
exports.getOrderList = async (userIdx, type, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);
      let result = [];

      //주문현황 조회
      if (type === 'basic'){
        const startItemIdx = (page - 1) * ITEMS_PER_PAGE.ARTIST_PAGE_ORDER_LIST_PER_PAGE;
        const basicOrderCreatedAtArr = await artistPageDao.getBasicOrderCreatedAtArr(
          connection, artistIdx, startItemIdx, ITEMS_PER_PAGE.ARTIST_PAGE_ORDER_LIST_PER_PAGE);
        
        for (let createdAt of basicOrderCreatedAtArr){
          const basicOrderInfo = await artistPageDao.getBasicOrderInfo(connection, artistIdx, createdAt);
        
          result.push({
            'createdAt': createdAt,
            'order': basicOrderInfo
          });
        }

        result.reverse();
      }
      //반품/취소 요청 현황 조회
      else if (type === 'cancelOrReturn'){
        const startItemIdx = (page - 1) * ITEMS_PER_PAGE.ARTIST_PAGE_CANCEL_OR_RETURN_LIST_PER_PAGE;
        const cancelOrReturnOrderCreatedAtArr = await artistPageDao.getcancelOrReturnOrderCreatedAtArr(
          connection, artistIdx, startItemIdx, ITEMS_PER_PAGE.ARTIST_PAGE_CANCEL_OR_RETURN_LIST_PER_PAGE);

          for (let createdAt of cancelOrReturnOrderCreatedAtArr){
            const cancelOrReturnOrderInfo = await artistPageDao.getcancelOrReturnOrderInfo(connection, artistIdx, createdAt);
          
            result.push({
              'createdAt': createdAt,
              'order': cancelOrReturnOrderInfo.map(item => {
                delete item.compareCreatedAt;
                return item;
              })
            });
          }
  
          result.reverse();
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getOrderList DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getOrderList DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}