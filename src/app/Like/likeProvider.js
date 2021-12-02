const likeDao = require('./likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getLikedArticleTotalPage = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const articleCnt = await likeDao.getLikedArticleTotalPage(connection, [userIdx]);
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (articleCnt % pageItemCnt == 0) ? articleCnt / pageItemCnt : parseInt(articleCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {'totalPages': totalPages};

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getProductDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getProductDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}