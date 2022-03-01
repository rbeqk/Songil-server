const searchDao = require('./searchDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getCorrespondIdxArr} = require('../../../modules/searchUtil');
const {pageInfo, getTotalPage} = require('../../../modules/pageUtil');
const {ITEMS_PER_PAGE} = require('../../../modules/constants');

exports.getSearchKeywords = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      let result = {};

      //최근검색어
      if (userIdx != -1){
        const recentlySearch = await searchDao.getRecentlySearch(connection, userIdx);
        result.recentlySearch = recentlySearch ? recentlySearch.map(item => item.word) : [];
      }
      else{
        result.recentlySearch = [];
      }

      //인기검색어
      const popularSearch = await searchDao.getPopularSearch(connection);
      result.popularSearch = popularSearch ? popularSearch.map(item => item.word) : [];

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

//검색 페이지 개수 조회
exports.getSearchPage = async (keyword, category) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const correspondIdxArr = await getCorrespondIdxArr(connection, keyword, category);

      const totalCnt = correspondIdxArr.length;
      const totalPages = getTotalPage(totalCnt, ITEMS_PER_PAGE.SEARCH_PER_PAGE);

      const result = new pageInfo(totalPages, ITEMS_PER_PAGE.SEARCH_PER_PAGE);

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getSearchPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getSearchPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//검색
exports.getSearch = async (userIdx, keyword, category, sort, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const categoryArr = ['shop', 'with', 'article'];

      let idxByCategory = [];
      for (let item of categoryArr){
        const correspondIdxArr = await getCorrespondIdxArr(connection, keyword, item);
        idxByCategory.push(correspondIdxArr);
      }

      let result = {};
      result.shopCnt = idxByCategory[0].length;
      result.withCnt = idxByCategory[1].length;
      result.articleCnt = idxByCategory[2].length;

      const startItemIdx = (page-1) * ITEMS_PER_PAGE.SEARCH_PER_PAGE;

      if (category === categoryArr[0]){
        const correspondIdxArr = idxByCategory[0];
        const craft = await searchDao.getCraftInfo(
          connection, userIdx, sort, correspondIdxArr, startItemIdx, ITEMS_PER_PAGE.SEARCH_PER_PAGE
        );

        result.craft = craft.reverse();
      }
      else if (category === categoryArr[1]){

      }
      else if (category === categoryArr[2]){

      }
      
      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getSearch DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getSearch DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}