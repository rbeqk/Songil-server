const articleDao = require('./articleDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getArticleList = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const articleList = await articleDao.getArticleList(connection, params);
      
      let result = [];

      articleList.forEach(item => {
        result.push({
          'articleIdx': item.articleIdx,
          'articleCategoryIdx': item.articleCategoryIdx,
          'title': item.title,
          'mainImageUrl': item.mainImageUrl,
          'editorIdx': item.editorIdx,
          'editorName': item.editorName
        })
      })
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArticleList DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArticleList DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}