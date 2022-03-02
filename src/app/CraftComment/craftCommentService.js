const craftCommentDao = require('./craftCommentDao');
const craftDao = require('../Craft/craftDao');
const orderStatusDao = require('../OrderStatus/orderStatusDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {CATEGORY} = require('../../../modules/constants');

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
      const isAlreadyReportedCraftComment = await craftCommentDao.isAlreadyReportedCraftComment(
        connection, userIdx, craftCommentIdx, CATEGORY.CRAFT
      );
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
      await craftCommentDao.reportCraftComment(
        connection, userIdx, craftCommentIdx, reportedReasonIdx, etcReason, CATEGORY.CRAFT
      );
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
exports.createCraftComment = async (userIdx, orderCraftIdx, comment, imageArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 orderCraftIdx인지
      const isExistOrderCraftIdx = await orderStatusDao.isExistOrderCraftIdx(connection, orderCraftIdx);
      if (!isExistOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_CRAFT_IDX);
      }

      //유저의 orderCraftIdx인지
      const isUserOrderCraftIdx = await orderStatusDao.isUserOrderOrderCraftIdx(connection, userIdx, orderCraftIdx);
      if (!isUserOrderCraftIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //댓글을 작성할 수 있는 상태의 orderCraftIdx인지
      const isPossibleToWriteComment = await craftCommentDao.isPossibleToWriteComment(connection, orderCraftIdx);
      if (!isPossibleToWriteComment){
        connection.release();
        return errResponse(baseResponse.IMPOSSIBLE_TO_WRITE_COMMENT_STATUS);
      }

      //이미 댓글 작성한 orderCraftIdx인지
      const isAlreadyWrittenComment = await craftCommentDao.isAlreadyWrittenComment(connection, orderCraftIdx);
      if (isAlreadyWrittenComment){
        connection.release();
        return errResponse(baseResponse.ALREADY_WRITTEN_COMMENT);
      }

      await connection.beginTransaction();
      
      //댓글 내용 추가
      const createCraftComment = await craftCommentDao.createCraftComment(connection, orderCraftIdx, comment);
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

//상품 댓글 삭제
exports.deleteCraftComment = async (userIdx, craftCommentIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 상품 댓글 idx인지
      const isExistCraftCommentIdx = await craftCommentDao.isExistCraftCommentIdx(connection, craftCommentIdx);
      if (!isExistCraftCommentIdx){
        connection.release();
        return errResponse(baseResponse.INVALD_CRAFT_COMMENT_IDX);
      }

      //자기 댓글인지
      const isUserCraftComment = await craftCommentDao.isUserCraftComment(connection, userIdx, craftCommentIdx);
      if (!isUserCraftComment){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      await connection.beginTransaction();
      await craftCommentDao.deleteCraftComment(connection, craftCommentIdx);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteCraftComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteCraftComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}