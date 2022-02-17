const likeDao = require('./likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ITEMS_PER_PAGE} = require("../../../modules/constants");

exports.getLikedArticle = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.LIKED_ARTICLE_PER_PAGE;

      const articleInfo = await likeDao.getLikedArticleInfo(connection, userIdx, startItemIdx, ITEMS_PER_PAGE.LIKED_ARTICLE_PER_PAGE);

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
          'isLike': 'Y'
        })
      });

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

exports.getLikedCraft = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.LIKED_CRAFT_PER_PAGE;
      
      const result = [];
      const likedCraftInfo = await likeDao.getLikedCraftInfo(connection, userIdx, startItemIdx, ITEMS_PER_PAGE.LIKED_CRAFT_PER_PAGE);

      likedCraftInfo.forEach(item => {
        result.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl,
          'name': item.name,
          'artistIdx': item.artistIdx,
          'artistName': item.artistName,
          'price': item.price,
          'isNew': item.isNew,
          'isSoldOut': item.isSoldOut,
          'totalLikeCnt': item.totalLikeCnt,
          'totalCommentCnt': item.totalCommentCnt,
        })
      });

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

//좋아요한 게시글
exports.getLikedPost = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.LIKED_WITH_PER_PAGE;

      const likedPost = await likeDao.getLikedPost(connection, userIdx, startItemIdx, ITEMS_PER_PAGE.LIKED_WITH_PER_PAGE);

      let result = [];

      likedPost.forEach(item => {
        result.push({
          'idx': item.idx,
          'categoryIdx': item.categoryIdx,
          'mainImageUrl': item.mainImageUrl,
          'title': item.title,
          'content': item.content,
          'name': item.name,
          'createdAt': item.createdAt,
          'totalLikeCnt': item.totalLikeCnt,
          'isLike': 'Y',
          'totalCommentCnt': item.totalCommentCnt
        })
      });

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getLikedPost DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikedPost DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}