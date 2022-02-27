const noticeDao = require('./noticeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//공지사항
exports.getNotice = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const notice = await noticeDao.getNotice(connection);

      connection.release();
      return response(baseResponse.SUCCESS, notice);

    }catch(err){
      connection.release();
      logger.error(`getNotice DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getNotice DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//F&Q
exports.getFAQ = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const faq = await noticeDao.getFAQ(connection);

      connection.release();
      return response(baseResponse.SUCCESS, faq);

    }catch(err){
      connection.release();
      logger.error(`getFAQ DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getFAQ DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}