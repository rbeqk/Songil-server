const benefitDao = require('./benefitDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//보유 베네핏 조회
exports.getBenefits = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const benefits = await benefitDao.getBenefits(connection, userIdx);
      const result = benefits;

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getBenefits DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getBenefits DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}