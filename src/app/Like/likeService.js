const likeDao = require('./likeDao');
const productDao = require('../Product/productDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.changeCraftLikeStatus = async (params) => {
  const userIdx = params[0];
  const productIdx = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 productIdx인지
      const isExistProductIdx = await productDao.isExistProductIdx(connection, productIdx);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);

      //현재 상품 좋아요 status 확인
      const isProductLike = await likeDao.productIsLike(connection, params);

      //상품 좋아요 status 변경
      if (isProductLike)
        await likeDao.changeProductToDisLike(connection, params);  //좋아요 눌렀을 경우 => delete record
      else
        await likeDao.changeProductToLike(connection, params);  //좋아요 아닐 경우 => create record

      const totalProductLikeCnt = await likeDao.getTotalProductLikeCnt(connection, productIdx);

      //product의 최종 좋아요 상태 가져오기(현재와 반대)
      let result = {};
      result.isLike = isProductLike ? 'N' : 'Y';
      result.totalLikeCnt = totalProductLikeCnt;

      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`changeLikeStatus DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`changeLikeStatus DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}