const likeDao = require('./likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage} = require("../../../modules/pageUtil");
const {
  LIKED_ARTICLE_PER_PAGE,
  LIKED_CRAFT_PER_PAGE
} = require("../../../modules/constants");

exports.getLikedArticleTotalPage = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const totalCnt = await likeDao.getLikedArticleTotalCnt(connection, [userIdx]);
      const totalPages = getTotalPage(totalCnt, LIKED_ARTICLE_PER_PAGE);

      const result = {
        'totalPages': totalPages
      };

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
      const startItemIdx = (page - 1) * LIKED_ARTICLE_PER_PAGE;

      const likedArticleIdx = await likeDao.getLikedArticleIdx(connection, [userIdx]);
      const articleList = likedArticleIdx.map(x => x.articleIdx);

      const articleInfo = await likeDao.getLikedArticleInfo(connection, [userIdx, articleList, startItemIdx, LIKED_ARTICLE_PER_PAGE]);

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
      const totalCnt = await likeDao.getLikedCraftTotalCnt(connection, [userIdx]);
      const totalPages = getTotalPage(totalCnt, LIKED_CRAFT_PER_PAGE)

      const result = {
        'totalPages': totalPages
      };

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

exports.getLikedCraft = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const startItemIdx = (page - 1) * LIKED_CRAFT_PER_PAGE;
      
      const result = [];
      const likedCraftInfo = await likeDao.getLikedCraftInfo(connection, [userIdx, userIdx, startItemIdx, LIKED_CRAFT_PER_PAGE]);

      likedCraftInfo.forEach(item => {
        result.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl,
          'name': item.name,
          'artistIdx': item.artistIdx,
          'artistName': item.artistName,
          'price': item.price,
          'isNew': item.isNew,
          'totalLikeCnt': item.totalLikeCnt,
          'isLike': 'Y',
          'totalCommentCnt': item.totalCommentCnt,
        })
      })

      result.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getLikedCraft DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikedCraft DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}