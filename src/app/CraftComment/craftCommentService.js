const craftCommentDao = require('./craftCommentDao');
const craftDao = require('../Craft/craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {CRAFT} = require('../../../modules/constants');

//상품 댓글 신고
exports.reportComment = async (userIdx, craftCommentIdx, reportedReasonIdx, etcReason) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 상품 댓글 idx인지
      const isExistCraftCommentIdx = await craftCommentDao.isExistCraftCommentIdx(connection, craftCommentIdx);
      if (!isExistCraftCommentIdx){
        connection.release();
        return errResponse(baseResponse.INVALD_CRAFT_COMMENT_IDX);
      }

      //사용자가 기존에 신고한 상품 댓글 idx인지
      const isAlreadyReportedCraftComment = await craftCommentDao.isAlreadyReportedCraftComment(connection, userIdx, craftCommentIdx, CRAFT);
      if (isAlreadyReportedCraftComment){
        connection.release();
        return errResponse(baseResponse.ALREADY_REPORTED_IDX);
      }

      //자기 댓글인지
      const isUserCraftComment = await craftCommentDao.isUserCraftComment(connection, userIdx, craftCommentIdx);
      if (isUserCraftComment){
        connection.release();
        return errResponse(baseResponse.CAN_NOT_REPORT_SELF);
      }

      await connection.beginTransaction();
      await craftCommentDao.reportCraftComment(connection, userIdx, craftCommentIdx, reportedReasonIdx, etcReason, CRAFT);
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

//댓글 작성
exports.createCraftComment = async (craftIdx, userIdx, comment, imageArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 상품 댓글 idx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      //TODO: 구매한 상품인지

      //TODO: 댓글 작성 횟수를 초과했는지

      await connection.beginTransaction();
      
      //댓글 내용 추가
      const createCraftComment = await craftCommentDao.createCraftComment(connection, craftIdx, userIdx, comment);
      const craftCommentIdx = createCraftComment.insertId;

      //댓글 사진 추가
      if (imageArr.length > 0){

        //포토 댓글로 update
        await craftCommentDao.updatePhotoCraftComment(connection, craftCommentIdx);

        for (let image of imageArr){
          await craftCommentDao.createCraftCommentImage(connection, craftCommentIdx, image);
        }
      }

      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createCraftComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createCraftComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}