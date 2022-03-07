const searchDao = require('./searchDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getCorrespondIdxArr} = require('../../../modules/searchUtil');
const {ITEMS_PER_PAGE, CATEGORY} = require('../../../modules/constants');

//최근 검색어 및 인기 검색어 조회
exports.getSearchKeywords = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      let result = {};

      //최근검색어
      if (userIdx != -1){
        const recentlySearch = await searchDao.getRecentlySearch(connection, userIdx);
        result.recentlySearch = recentlySearch;
      }
      else{
        result.recentlySearch = [];
      }

      //인기검색어
      const popularSearch = await searchDao.getPopularSearch(connection);
      result.popularSearch = popularSearch;

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
        const correspondIdxArrByCategory = idxByCategory[1];
        const storyIdxArr = correspondIdxArrByCategory.filter(item => item.categoryIdx === CATEGORY.STORY).map(item => item.storyIdx);
        const qnaIdxArr = correspondIdxArrByCategory.filter(item => item.categoryIdx === CATEGORY.QNA).map(item => item.qnaIdx);
        const abTestIdxArr = correspondIdxArrByCategory.filter(item => item.categoryIdx === CATEGORY.ABTEST).map(item => item.abTestIdx);

        const withInfo = await searchDao.getWithInfo(
          connection, userIdx, sort, storyIdxArr, qnaIdxArr, abTestIdxArr, startItemIdx, ITEMS_PER_PAGE.SEARCH_PER_PAGE
        );

        result.with = [];
        withInfo.forEach(item => 
          result.with.push({
            'idx': item.idx,
            'categoryIdx': item.categoryIdx,
            'mainImageUrl': item.mainImageUrl,
            'title': item.title,
            'content': item.content,
            'name': item.name,
            'createdAt': item.createdAt,
            'totalLikeCnt': item.totalLikeCnt,
            'isLike': item.isLike,
            'totalCommentCnt': item.totalCommentCnt
          })
        )
        
        result.with.reverse();
      }
      else if (category === categoryArr[2]){
        const correspondIdxArr = idxByCategory[2];
        const article = await searchDao.getArticleInfo(
          connection, userIdx, sort, correspondIdxArr, startItemIdx, ITEMS_PER_PAGE.SEARCH_PER_PAGE
        );

        result.article = article.reverse();
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