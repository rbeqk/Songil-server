const searchDao = require('./searchDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.deleteUserRecentlySearch = async (params) => {
  //params = [userIdx, searchIdx]
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //유효한 user의 search 항목인지
      const isExistUserSearchIdx = await searchDao.isExistUserSearchIdx(connection, params);
      if (!isExistUserSearchIdx) return errResponse(baseResponse.INVALID_USER_SEARCH_IDX);
      
      await connection.beginTransaction();

      //최근검색어 삭제
      await searchDao.deleteUserRecentlySearch(connection, params);
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

exports.deleteAllUserRecentlySearch = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //user의 지울 검색어가 있는지
      const isExistUserSearchs = await searchDao.isExistUserSearchs(connection, params);
      if (!isExistUserSearchs) return errResponse(baseResponse.EMPTY_USER_SEARCH);
      
      await connection.beginTransaction();

      //최근검색어 전체 삭제
      await searchDao.deleteAllUserRecentlySearch(connection, params);
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