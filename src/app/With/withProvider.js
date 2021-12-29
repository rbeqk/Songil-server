const withDao = require('./withDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getHotTalk = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const getHotTalk = await withDao.getHotTalk(connection);

      let result = [];

      if (getHotTalk.length){
        getHotTalk.forEach(item => {
          result.push({
            'idx': item.idx,
            'categoryIdx': item.categoryIdx,
            'text': item.text,
            'imageUrl': item.imageUrl,
            'totalCommentCnt': item.totalCommentCnt
          })
        })
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getHotTalk DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getHotTalk DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}