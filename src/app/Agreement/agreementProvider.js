const agreementDao = require('./agreementDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getAgreements = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const agreements = await agreementDao.getAgreements(connection);
      let result = [];

      agreements.forEach(item => {
        result.push({
          'agreementIdx': item.agreementIdx,
          'title': item.title,
          'isRequired': item.isRequired,
          'hasContent': item.hasContent
        })
      });

      if (result.length > 0) return response(baseResponse.SUCCESS, result);
      else return errResponse(baseResponse.EMPTY_AGREEMENTS);
      
    }catch(err){
      connection.release();
      logger.error(`getAgreements DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getAgreements DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}