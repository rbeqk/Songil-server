const reviewDao = require('./reviewDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.reportComment = async (params) => {
  //params = [userIdx, commentIdx, reportedReasonIdx, etcReason]
  const userIdx = params[0];
  const commentIdx = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 상품 댓글 idx인지
      const isExistCraftCommentIdx = await reviewDao.isExistCraftCommentIdx(connection, [commentIdx]);
      if (!isExistCraftCommentIdx) return errResponse(baseResponse.INVALD_CRAFT_COMMENT_IDX);

      //사용자가 기존에 신고한 상품 댓글 idx인지
      const isExistUserReportedCommentIdx = await reviewDao.isExistUserReportedCommentIdx(connection, [userIdx, commentIdx]);
      if (isExistUserReportedCommentIdx) return errResponse(baseResponse.ALREADY_REPORTED_CRAFT_COMMENT_IDX);

      await connection.beginTransaction();

      //댓글 신고
      await reviewDao.reportComment(connection, params);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`reportComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`reportComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}