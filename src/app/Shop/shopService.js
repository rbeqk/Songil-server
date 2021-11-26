const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.deleteUserRecentlySearch = async (params) => {
  const userIdx = params[0];
  const userSearchIdx = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //유효한 userSearchIdx인지
      const isExistUserSearchIdx = await shopDao.isExistUserSearchIdx(connection, params);
      if (!isExistUserSearchIdx) return errResponse(baseResponse.INVALID_USER_SEARCH_IDX);
      
      await connection.beginTransaction();

      //최근검색어 삭제
      await shopDao.deleteUserRecentlySearch(connection, userSearchIdx);
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