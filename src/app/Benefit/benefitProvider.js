const benefitDao = require('./benefitDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {BenefitInfoDTO} = require('./benefitDto');

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

      //유저의 사용 가능한 모든 베네핏idx
      const userAllBenefitIdxArr = await benefitDao.getUserAllBenefitIdxArr(connection, userIdx);

      //해당 orderIdx의 총 상품 결제 금액
      const totalCraftPrice = await benefitDao.getTotalCraftPrice(connection, orderIdx);

      //사용할 수 있는 가격 별 쿠폰
      const canUseBenefitIdxByPriceArr = await benefitDao.getCanUseBenefitIdxByPriceArr(connection, totalCraftPrice, userAllBenefitIdxArr);

      //사용할 수 있는 작가 별 쿠폰
      let canUseBenefitIdxByArtistArr = [];
      const orderCraftByArtist = await benefitDao.getOrderCraftByArtist(connection, orderIdx);
      for (let i=0; i< orderCraftByArtist.length; i++){
        const artistIdx = orderCraftByArtist[i].artistIdx;
        const totalArtistCraftPrice = orderCraftByArtist[i].totalArtistCraftPrice;

        const canUseBenefitIdxAByArtist = await benefitDao.getCanUseBenefitIdxAByArtist(connection, artistIdx, totalArtistCraftPrice, userAllBenefitIdxArr);
        canUseBenefitIdxByArtistArr.push(canUseBenefitIdxAByArtist);
      }

      //사용할 수 있는 가격 별 + 작가 별 쿠폰
      const canUseBenefitIdxArr = canUseBenefitIdxByPriceArr.concat(canUseBenefitIdxByArtistArr);
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