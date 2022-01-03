const searchDao = require('./searchDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.deleteUserRecentlySearch = async (userIdx, word) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //word의 searchIdx가져오기
      const getSearchIdx = await searchDao.getSearchIdx(connection, word);
      if (!getSearchIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_SEARCH_IDX);
      }
      
      const searchIdx = getSearchIdx.searchIdx;
      
      //유효한 user의 word인지
      const isExistUserSearchIdx = await searchDao.isExistUserSearchIdx(connection, userIdx, searchIdx);
      if (!isExistUserSearchIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_SEARCH_IDX);
      }
      
      await connection.beginTransaction();

      //최근검색어 삭제
      await searchDao.deleteUserRecentlySearch(connection, userIdx, searchIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteUserRecentlySearch DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteUserRecentlySearch DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.deleteAllUserRecentlySearch = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //user의 지울 검색어가 있는지
      const isExistUserSearchs = await searchDao.isExistUserSearchs(connection, userIdx);
      if (!isExistUserSearchs){
        connection.release();
        return errResponse(baseResponse.EMPTY_USER_SEARCH);
      }
      
      await connection.beginTransaction();

      //최근검색어 전체 삭제
      await searchDao.deleteAllUserRecentlySearch(connection, userIdx);
      await connection.commit();
      
      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteAllUserRecentlySearch DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteAllUserRecentlySearch DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}