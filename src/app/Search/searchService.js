const searchDao = require('./searchDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getCorrespondIdxArr} = require('../../../modules/searchUtil');
const {pageInfo, getTotalPage} = require('../../../modules/pageUtil');
const {ITEMS_PER_PAGE} = require('../../../modules/constants');

//검색 페이지 개수 조회
exports.getSearchPage = async (keyword, category, userIdx, clientIp) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const correspondIdxArr = await getCorrespondIdxArr(connection, keyword, category);

      const totalCnt = correspondIdxArr.length;
      const totalPages = getTotalPage(totalCnt, ITEMS_PER_PAGE.SEARCH_PER_PAGE);
      const result = new pageInfo(totalPages, ITEMS_PER_PAGE.SEARCH_PER_PAGE);

      await connection.beginTransaction();
      const isExistSearchRecord = await searchDao.isExistSearchRecord(connection, userIdx, clientIp, keyword);
      if (!isExistSearchRecord){
        await searchDao.createSearchRecord(connection, userIdx, clientIp, keyword);
      }
      
      const canReflectSearchCnt = await searchDao.canReflectSearchCnt(connection, clientIp, keyword);
      if (!isExistSearchRecord && canReflectSearchCnt){
        await searchDao.updateSearchCntRecord(connection, clientIp, keyword);

        const isExistSearch = await searchDao.isExistSearch(connection, keyword, clientIp);
        if (isExistSearch){
          await searchDao.updateSearch(connection, keyword);
        }
        else{
          await searchDao.insertSearch(connection, keyword);
        }
      }
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`getSearchPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getSearchPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.deleteUserRecentlySearch = async (userIdx, word) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //유효한 user의 word인지
      const isExistUserSearch = await searchDao.isExistUserSearch(connection, userIdx, word);
      if (!isExistUserSearch){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_SEARCH);
      }
      
      await connection.beginTransaction();

      //최근검색어 삭제
      await searchDao.deleteUserRecentlySearch(connection, userIdx, word);
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