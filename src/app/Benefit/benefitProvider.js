const benefitDao = require('./benefitDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {BenefitInfoDTO} = require('./benefitDto');
const {getCanUseBenefitIdxArr} = require('../../../modules/benefitUtil');

//보유 베네핏 조회
exports.getBenefits = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const benefits = await benefitDao.getBenefits(connection, userIdx);
      const result = benefits.map(item => new BenefitInfoDTO(item));

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

//주문 시 적용 가능 베네핏 조회
exports.getCanUseBenefit = async (userIdx, orderIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistOrderIdx = await benefitDao.isExistOrderIdx(connection, orderIdx);
      if (!isExistOrderIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_IDX);
      }

      const isValidOrderIdx = await benefitDao.isValidOrderIdx(connection, orderIdx);
      if (!isValidOrderIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_PAYMENT_ORDER_IDX);
      }

      const isUserOrderIdx = await benefitDao.isUserOrderIdx(connection, userIdx, orderIdx);
      if (!isUserOrderIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //사용할 수 있는 가격 별 + 작가 별 쿠폰
      const canUseBenefitIdxArr = await getCanUseBenefitIdxArr(connection, userIdx, orderIdx);
      if (!canUseBenefitIdxArr){
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
      }
      
      const canUseBenefitInfo = await benefitDao.getCanUseBenefitInfo(connection, canUseBenefitIdxArr);

      const result = canUseBenefitInfo.map(item => new BenefitInfoDTO(item));

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getCanUseBenefit DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCanUseBenefit DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}