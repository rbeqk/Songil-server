const artistAskDao = require('./artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//1:1 문의 답변 등록
exports.createAskComment = async (userIdx, askIdx, content) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 askIdx인지
      const isExistAskIdx = await artistAskDao.isExistAskIdx(connection, askIdx);
      if (!isExistAskIdx){
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
      const isArtistAsk = await artistAskDao.isArtistAsk(connection, askIdx, artistIdx);
      if (!isArtistAsk){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //이미 답변한 문의인지
      const isAlreadyAnswerAskIdx = await artistAskDao.isAlreadyAnswerAskIdx(connection, askIdx);
      if (isAlreadyAnswerAskIdx){
        connection.release();
        return errResponse(baseResponse.IS_ALREADY_ANSWER_ASK_IDX);
      }

      //1:1문의 답변 작성
      await connection.beginTransaction();
      await artistAskDao.createAskComment(connection, askIdx, content);
      await artistAskDao.updateAskStatus(connection, askIdx);
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