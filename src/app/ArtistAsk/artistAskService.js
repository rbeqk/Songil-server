const artistAskDao = require('./artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.createAskComment = async (userIdx, craftAskIdx, comment) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 askIdx인지
      const isExistCraftAskIdx = await artistAskDao.isExistCraftAskIdx(connection, craftAskIdx);
      if (!isExistCraftAskIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ASK_IDX);
      }

      //작가 여부
      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //작가idx 가져오기
      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);

      //문의에 대한 작가 권한 확인
      const isArtistAsk = await artistAskDao.isArtistAsk(connection, craftAskIdx, artistIdx);
      if (!isArtistAsk){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //이미 답변한 문의인지
      const isAlreadyCommentAskIdx = await artistAskDao.isAlreadyCommentAskIdx(connection, craftAskIdx);
      if (isAlreadyCommentAskIdx){
        connection.release();
        return errResponse(baseResponse.IS_ALREADY_COMMENT_ASK_IDX);
      }

      //1:1문의 답변 작성
      await connection.beginTransaction();
      await artistAskDao.createAskComment(connection, craftAskIdx, comment);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);

    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createAskComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createAskComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}