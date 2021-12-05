const likeDao = require('./likeDao');
const productDao = require('../Product/productDao');
const articleDao = require('../Article/articleDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.changeCraftLikeStatus = async (userIdx, craftIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await productDao.isExistCraftIdx(connection, [craftIdx]);
      if (!isExistCraftIdx) return errResponse(baseResponse.INVALID_CRAFT_IDX);

      //현재 상품 좋아요 status 확인
      const isCraftLike = await likeDao.craftIsLike(connection, [userIdx, craftIdx]);

      await connection.beginTransaction();

      //상품 좋아요 status 변경
      if (isCraftLike)
        await likeDao.changeCraftToDisLike(connection, [userIdx, craftIdx]);  //좋아요 눌렀을 경우 => delete record
      else
        await likeDao.changeCraftToLike(connection, [userIdx, craftIdx]);  //좋아요 아닐 경우 => create record
      
      const totalCraftLikeCnt = await likeDao.getTotalCraftLikeCnt(connection, [craftIdx]);

      //craft의 최종 좋아요 상태 가져오기(현재와 반대)
      let result = {};
      result.isLike = isCraftLike ? 'N' : 'Y';
      result.totalLikeCnt = totalCraftLikeCnt;

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`changeCraftLikeStatus DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`changeCraftLikeStatus DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.changeArticleLikeStuatus = async (userIdx, articleIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 articleIdx인지
      const isExistArticleIdx = await articleDao.isExistArticleIdx(connection, [articleIdx]);
      if (!isExistArticleIdx) return errResponse(baseResponse.INVALID_ARTICLE_IDX);

      //현재 아티클 좋아요 status 확인
      const isArticleLike = await likeDao.articleLikeStatus(connection, [userIdx, articleIdx]);

      await connection.beginTransaction();

      //상품 아티클 status 변경
      if (isArticleLike)
        await likeDao.changeArticleToDisLike(connection, [userIdx, articleIdx]);  //좋아요 눌렀을 경우 => delete record
      else
        await likeDao.changeArticleToLike(connection, [userIdx, articleIdx]);  //좋아요 아닐 경우 => create record

      const totalArticleLikeCnt = await likeDao.getTotalArticleLikeCnt(connection, [articleIdx]);

      //아티클의 최종 좋아요 상태 가져오기(현재와 반대)
      let result = {};
      result.isLike = isArticleLike ? 'N' : 'Y';
      result.totalLikeCnt = totalArticleLikeCnt;

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`changeArticleLikeStuatus DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`changeArticleLikeStuatus DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}