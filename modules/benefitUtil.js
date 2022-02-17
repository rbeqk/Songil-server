const benefitDao = require('../src/app/Benefit/benefitDao');
const orderDao = require('../src/app/Order/orderDao');
const {logger} = require('../config/winston');

class appliedBenefitInfo{
  constructor(
    benefitIdx,
    title,
    beneiftDiscount,
    finalPrice
  ){
    this.benefitIdx = benefitIdx;
    this.title = title;
    this.beneiftDiscount = beneiftDiscount;
    this.finalPrice = finalPrice;
  }
}

const getCanUseBenefitIdxArr = async (connection, userIdx, orderIdx) => {
  try{
    //유저의 사용 가능한 모든 베네핏idx(없을 경우 유효하지 않은 값으로)
    const userAllBenefitIdxArr = await benefitDao.getUserAllBenefitIdxArr(connection, userIdx);

    //해당 orderIdx의 총 상품 결제 금액
    const totalCraftPrice = await orderDao.getTotalCraftPrice(connection, orderIdx);

    //사용할 수 있는 가격 별 쿠폰
    const canUseBenefitIdxArrByPrice = await benefitDao.getCanUseBenefitIdxArrByPrice(connection, totalCraftPrice, userAllBenefitIdxArr);

    //사용할 수 있는 작가 별 쿠폰
    let canUseBenefitIdxArrByArtist = [];
    const orderCraftByArtist = await orderDao.getOrderCraftByArtist(connection, orderIdx);
    for (let i=0; i< orderCraftByArtist.length; i++){
      const artistIdx = orderCraftByArtist[i].artistIdx;
      const totalArtistCraftPrice = orderCraftByArtist[i].totalArtistCraftPrice;

      canUseBenefitIdxArrByArtist = await benefitDao.getCanUseBenefitIdxArrByArtist(connection, artistIdx, totalArtistCraftPrice, userAllBenefitIdxArr);
    }

    //사용할 수 있는 가격 별 + 작가 별 쿠폰
    const canUseBenefitIdxArr = [...canUseBenefitIdxArrByPrice, ...canUseBenefitIdxArrByArtist];

    return canUseBenefitIdxArr;
  }catch(err){
    logger.error(`getCanUseBenefitIdxArr DB Query Error: ${err}`);
    return false;
  }
}

module.exports = {
  appliedBenefitInfo,
  getCanUseBenefitIdxArr,
}