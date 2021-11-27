const reviewDao = require('./reviewDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.reportReview = async (params) => {
  //params = [userIdx, productReviewIdx, reportedReasonIdx, etcReason]
  const userIdx = params[0];
  const productReviewIdx = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 상품 리뷰 idx인지
      const isExistProductReviewIdx = await reviewDao.isExistProductReviewIdx(connection, productReviewIdx);
      if (!isExistProductReviewIdx) return errResponse(baseResponse.INVALD_PRODUT_REVIEW_IDX);

      //사용자가 기존에 신고한 상품 리뷰 idx인지
      const isExistUserReportedReviewIdx = await reviewDao.isExistUserReportedReviewIdx(connection, [userIdx, productReviewIdx]);
      if (isExistUserReportedReviewIdx) return errResponse(baseResponse.ALREADY_REPORTED_PRODUCT_REVIEW_IDX);

      await connection.beginTransaction();

      //리뷰 신고
      await reviewDao.reportReview(connection, params);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reportReview DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reportReview DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}