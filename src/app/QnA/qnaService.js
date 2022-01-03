const qnaDao = require('./qnaDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');


exports.createQnA = async (userIdx, title, content) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      await connection.beginTransaction();
      const createQnA = await qnaDao.createQnA(connection, userIdx, title, content);

      const qnaIdx = createQnA.insertId;

      const result = {
        'qnaIdx': qnaIdx
      };

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createQnA DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createQnA DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//qna 삭제
exports.deleteQnA = async (userIdx, qnaIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 qna인지
      const isExistQnaIdx = await qnaDao.isExistQnaIdx(connection, qnaIdx);
      if (!isExistQnaIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_QNA_IDX);
      }

      //qna의 userIdx 가져오기
      const qnaUserIdx = await qnaDao.getStoryUserIdx(connection, qnaIdx);
      if (qnaUserIdx !== userIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }
      
      await connection.beginTransaction();
      await qnaDao.deleteQnA(connection, qnaIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteQnA DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteQnA DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//qna 수정
exports.updateQnA = async (userIdx, qnaIdx, title, content) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 qna인지
      const isExistQnaIdx = await qnaDao.isExistQnaIdx(connection, qnaIdx);
      if (!isExistQnaIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_QNA_IDX);
      }

      //qna의 userIdx 가져오기
      const qnaUserIdx = await qnaDao.getStoryUserIdx(connection, qnaIdx);
      if (qnaUserIdx !== userIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }
      
      await connection.beginTransaction();
      await qnaDao.updateQnA(connection, qnaIdx, title, content);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteQnA DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteQnA DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}