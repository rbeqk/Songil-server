const likeDao = require('./likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getLikedArticleTotalPage = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const articleCnt = await likeDao.getLikedArticleTotalCnt(connection, [userIdx]);
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (articleCnt % pageItemCnt == 0) ? articleCnt / pageItemCnt : parseInt(articleCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {'totalPages': totalPages};

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getLikedArticleTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikedArticleTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getLikedArticle = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const articleCnt = await likeDao.getLikedArticleTotalCnt(connection, [userIdx]);
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (articleCnt % pageItemCnt == 0) ? articleCnt / pageItemCnt : parseInt(articleCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지

      const startItemIdx = (page - 1) * pageItemCnt;

      const likedArticleIdx = await likeDao.getLikedArticleIdx(connection, [userIdx]);
      const articleList = likedArticleIdx.map(x => x.articleIdx);

      const articleInfo = await likeDao.getLikedArticleInfo(connection, [userIdx, articleList, startItemIdx, pageItemCnt]);

      let result = [];
      
      articleInfo.forEach(item => {
        result.push({
          'articleIdx': item.articleIdx,
          'title': item.title,
          'mainImageUrl': item.mainImageUrl,
          'editorIdx': item.editorIdx,
          'editorName': item.editorName,
          'createdAt': item.createdAt,
          'totalLikeCnt': item.totalLikeCnt,
        })
      })

      result.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getLikedArticle DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikedArticle DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getLikedCraftTotalPage = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const craftCnt = await likeDao.getLikedCraftTotalCnt(connection, [userIdx]);
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (craftCnt % pageItemCnt == 0) ? craftCnt / pageItemCnt : parseInt(craftCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {'totalPages': totalPages};

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getLikedCraftTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikedCraftTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}