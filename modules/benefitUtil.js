const benefitDao = require('../src/app/Benefit/benefitDao');
const orderDao = require('../src/app/Order/orderDao');

const getCanUseBenefitIdxArr = async (connection, userIdx, orderIdx) => {
  try{
    //유저의 사용 가능한 모든 베네핏idx
    const userAllBenefitIdxArr = await benefitDao.getUserAllBenefitIdxArr(connection, userIdx);

    //해당 orderIdx의 총 상품 결제 금액
    const totalCraftPrice = await orderDao.getTotalCraftPrice(connection, orderIdx);

    //사용할 수 있는 가격 별 쿠폰
    const canUseBenefitIdxByPriceArr = await benefitDao.getCanUseBenefitIdxByPriceArr(connection, totalCraftPrice, userAllBenefitIdxArr);

    //사용할 수 있는 작가 별 쿠폰
    let canUseBenefitIdxByArtistArr = [];
    const orderCraftByArtist = await orderDao.getOrderCraftByArtist(connection, orderIdx);
    for (let i=0; i< orderCraftByArtist.length; i++){
      const artistIdx = orderCraftByArtist[i].artistIdx;
      const totalArtistCraftPrice = orderCraftByArtist[i].totalArtistCraftPrice;

      const canUseBenefitArrByArtist = await benefitDao.getCanUseBenefitArrByArtist(connection, artistIdx, totalArtistCraftPrice, userAllBenefitIdxArr);
      canUseBenefitIdxByArtistArr.push(...canUseBenefitArrByArtist.map(item => item.benefitIdx));
    }

    //사용할 수 있는 가격 별 + 작가 별 쿠폰
    const canUseBenefitIdxArr = canUseBenefitIdxByPriceArr.concat(canUseBenefitIdxByArtistArr);

    return canUseBenefitIdxArr;
  }catch(err){
    logger.error(`getCanUseBenefitIdxArr DB Query Error: ${err}`);
    return false;
  }
}

module.exports = {
  getCanUseBenefitIdxArr,
}