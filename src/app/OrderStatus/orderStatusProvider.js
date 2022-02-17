const orderStatusDao = require('./orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ITEMS_PER_PAGE} = require("../../../modules/constants");

//결제 정보 조회
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

//주문 현황 조회
exports.getOrderList = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const startItemIdx = (page-1) * ITEMS_PER_PAGE.MY_PAGE_ORDER_LIST_PER_PAGE;
      let result = [];

      const userOrderInfoArr = await orderStatusDao.getUserOrderInfoArr(
        connection, userIdx, startItemIdx, ITEMS_PER_PAGE.MY_PAGE_ORDER_LIST_PER_PAGE
      );
      for (let i=0; i<userOrderInfoArr.length; i++){
        const {orderIdx, createdAt} = userOrderInfoArr[i];
        const orderCraftInfoArr = await orderStatusDao.getOrderCraftInfoArr(connection, orderIdx);

        result.push({
          createdAt,
          orderIdx,
          'orderDetail': []
        });

        for (let orderCraftInfo of orderCraftInfoArr){
          result[i].orderDetail.push(orderCraftInfo);
        }
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