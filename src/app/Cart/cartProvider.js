const cartDao = require('./cartDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//장바구니 조회
exports.getCart = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const cart = await cartDao.getCart(connection, userIdx);
      const result = cart;

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getCart DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCart DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//장바구니 상품 개수 조회
exports.getCartCnt = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const totalCnt = await cartDao.getCartCnt(connection, userIdx);
      const result = {
        'totalCnt': totalCnt
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getCartCnt DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCartCnt DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}