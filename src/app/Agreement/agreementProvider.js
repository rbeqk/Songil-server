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

      connection.release();

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

exports.getAgreementDetail = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 agreementIdx인지
      const isExistAgreementIdx = await agreementDao.isExistAgreementIdx(connection, params);
      if (!isExistAgreementIdx) return errResponse(baseResponse.INVALID_AGEEMENT_IDX);

      //상세 정보 가져오기
      const agreementDetail = await agreementDao.getAgreementDetail(connection, params);

      let result = {};
      result.agreementIdx = agreementDetail.agreementIdx;
      result.content = agreementDetail.content;

      connection.release();

      return response(baseResponse.SUCCESS, result);
      
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