const craftCommentDao = require('./craftCommentDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.reportComment = async (userIdx, craftCommentIdx, reportedReasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 상품 댓글 idx인지
      const isExistCraftCommentIdx = await craftCommentDao.isExistCraftCommentIdx(connection, [craftCommentIdx]);
      if (!isExistCraftCommentIdx) return errResponse(baseResponse.INVALD_CRAFT_COMMENT_IDX);

      //사용자가 기존에 신고한 상품 댓글 idx인지
      const isExistUserReportedCommentIdx = await craftCommentDao.isExistUserReportedCommentIdx(connection, [userIdx, craftCommentIdx]);
      if (isExistUserReportedCommentIdx) return errResponse(baseResponse.ALREADY_REPORTED_CRAFT_COMMENT_IDX);

      //자기 댓글인지
      const isUserCraftComment = await craftCommentDao.isUserCraftComment(connection, [userIdx, craftCommentIdx]);
      if (isUserCraftComment) return errResponse(baseResponse.CAN_NOT_REPORT_SELF);

      await connection.beginTransaction();

      //댓글 신고
      await craftCommentDao.reportComment(connection, [userIdx, craftCommentIdx, reportedReasonIdx, etcReason]);
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