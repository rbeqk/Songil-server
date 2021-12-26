const abTestDao = require('./abTestDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.createABTest = async (userIdx, content, deadline, imageArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //작가의 userIdx인지
      const isArtistUserIdx = await abTestDao.isArtistUserIdx(connection, userIdx);
      if (!isArtistUserIdx) return errResponse(baseResponse.NO_PERMISSION);

      //작가idx 가져오기
      const artistIdx = await abTestDao.getArtistIdx(connection, userIdx);
      
      await connection.beginTransaction();
      await abTestDao.createABTest(connection, content, deadline, imageArr, artistIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//abTest 삭제
exports.deleteABTest = async (userIdx, abTestIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx) return errResponse(baseResponse.INVALID_ABTEST_IDX);

      //작가의 userIdx인지
      const isArtistUserIdx = await abTestDao.isArtistUserIdx(connection, userIdx);
      if (!isArtistUserIdx) return errResponse(baseResponse.NO_PERMISSION);

      //abTest 작가의 userIdx 가져오기
      const abTestUserIdx = await abTestDao.getAbTestUserIdx(connection, abTestIdx);
      if (abTestUserIdx !== userIdx) return errResponse(baseResponse.NO_PERMISSION);
      
      await connection.beginTransaction();
      await abTestDao.deleteABTest(connection, abTestIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteABTest DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteABTest DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}