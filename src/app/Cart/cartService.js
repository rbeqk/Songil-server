const cartDao = require('./cartDao');
const craftDao = require('../Craft/craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//장바구니 상품 추가
exports.addCartCraft = async(craftIdx, amount, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      //품절된 상품인지
      const isSoldOutCraft = await cartDao.isSoldOutCraft(connection, craftIdx);
      if (isSoldOutCraft){
        connection.release();
        return errResponse(baseResponse.SOLD_OUT_CRAFT_IDX);
      }

      await connection.beginTransaction();

      //해당 상품이 장바구니에 담겨있을 시 개수
      const cartCraftAmount = await cartDao.getCartCraftAmount(connection, userIdx, craftIdx);
      if (cartCraftAmount){
        await cartDao.updateCartCraftAmount(connection, userIdx, craftIdx, cartCraftAmount + amount);
      }
      else{
        await cartDao.addCartCraft(connection, userIdx, craftIdx, amount);
      }

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`addCartCraft DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`addCartCraft DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//장바구니 상품 삭제
exports.deleteCartCraft = async (userIdx, craftIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      //장바구니에 담긴 상품인지
      const isCraftInCart = await cartDao.isCraftInCart(connection, userIdx, craftIdx);
      if (!isCraftInCart){
        connection.release();
        return errResponse(baseResponse.NOT_IN_CART_CRAFT_IDX);
      }

      await connection.beginTransaction();

      await cartDao.deleteCartCraft(connection, userIdx, craftIdx);

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteCartCraft DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteCartCraft DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}