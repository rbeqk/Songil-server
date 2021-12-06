const searchDao = require('./searchDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getSearchKeywords = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let result = {};
      result.recentlySearch = null;

      //사용자 있을 경우 => 최근검색어 추가
      if (params[0]){
        const recentlySearch = await searchDao.getRecentlySearch(connection, params);
        if (recentlySearch.length) result.recentlySearch = [];

        recentlySearch.forEach(item => {
          result.recentlySearch.push({
            'searchIdx': item.searchIdx,
            'word': item.word
          });
        })
      }

      result.popularSearch = null;
      //인기검색어
      const popularSearch = await searchDao.getPopularSearch(connection);
      if (popularSearch.length) result.popularSearch = [];

      popularSearch.forEach(item => {
        result.popularSearch.push({
          'searchIdx': item.searchIdx,
          'word': item.word
        })
      })

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getSearchKeywords DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getSearchKeywords DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}