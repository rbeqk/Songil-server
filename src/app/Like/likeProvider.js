const likeDao = require('./likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage} = require("../../../modules/pageUtil");
const {
  LIKED_ARTICLE_PER_PAGE,
  LIKED_CRAFT_PER_PAGE,
  LIKED_WITH_PER_PAGE
} = require("../../../modules/constants");

exports.getLikedArticleTotalPage = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const totalCnt = await likeDao.getLikedArticleTotalCnt(connection, userIdx);
      const totalPages = getTotalPage(totalCnt, LIKED_ARTICLE_PER_PAGE);

      const result = {
        'totalPages': totalPages,
        'itemsPerPage': LIKED_ARTICLE_PER_PAGE
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

      const articleInfo = await likeDao.getLikedArticleInfo(connection, userIdx, startItemIdx, LIKED_ARTICLE_PER_PAGE);

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
      const totalCnt = await likeDao.getLikedCraftTotalCnt(connection, userIdx);
      const totalPages = getTotalPage(totalCnt, LIKED_CRAFT_PER_PAGE);

      const result = {
        'totalPages': totalPages,
        'itemPerPage': LIKED_CRAFT_PER_PAGE
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
      const likedCraftInfo = await likeDao.getLikedCraftInfo(connection, userIdx, startItemIdx, LIKED_CRAFT_PER_PAGE);

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

//좋아요한 게시글 페이지(Story && QnA)
exports.getLikePostCnt = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //좋아요한 Story 개수
      const likedStoryCnt = await likeDao.getLikedStoryCnt(connection, userIdx);

      //좋아요한 QnA 개수
      const likedQnACnt = await likeDao.getLikedQnACnt(connection, userIdx);

      //좋아요한 게시글 개수
      const totalCnt = likedStoryCnt + likedQnACnt;
      const totalPages = getTotalPage(totalCnt, LIKED_WITH_PER_PAGE);

      const result = {
        'totalPages': totalPages,
        'itemPerPage': LIKED_WITH_PER_PAGE
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getLikePostCnt DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikePostCnt DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//좋아요한 게시글
exports.getLikedPost = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const startItemIdx = (page - 1) * LIKED_WITH_PER_PAGE;

      const likedPost = await likeDao.getLikedPost(connection, userIdx, startItemIdx, LIKED_WITH_PER_PAGE);

      let result = [];

      likedPost.forEach(item => {
        result.push({
          'idx': item.idx,
          'categoryIdx': item.categoryIdx,
          'imageUrl': item.imageUrl,
          'title': item.title,
          'content': item.content,
          'userIdx': item.userIdx,
          'userName': item.userName,
          'createdAt': item.createdAt,
          'totalLikeCnt': item.totalLikeCnt,
          'totalCommentCnt': item.totalCommentCnt
        })
      });

      result.reverse();

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