const reviewDao = require('./reviewDao');
const shopDao = require('../Shop/shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getReviewTotalPage = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 productIdx인지
      const isExistProductIdx = await shopDao.isExistProductIdx(connection, params);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const reviewCnt = await reviewDao.getReviewCnt(connection, params); //존재하는 리뷰 개수
      const totalPages = (reviewCnt % pageItemCnt == 0) ? reviewCnt / pageItemCnt : parseInt(reviewCnt / pageItemCnt) + 1;

      const result = {'totalPages': totalPages};

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getReviewTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getReviewTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}