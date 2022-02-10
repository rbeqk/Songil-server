const orderDao = require('./orderDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getCanUseBenefitIdxArr} = require('../../../modules/benefitUtil');
const RestClient = require('@bootpay/server-rest-client').RestClient;
const {appliedBenefitInfo} = require('../../../modules/benefitUtil');

exports.addCraftInOrderSheet = async (userIdx, craftIdxArr, amountArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재&&품절X 상품 idx 개수
      const existCraftIdxLen = await orderDao.getExistCraftIdxLen(connection, craftIdxArr);
      if (existCraftIdxLen !== craftIdxArr.length){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      //기존에 주문 안한 주문서 내역 다 삭제
      await orderDao.deleteUserNotPaidOrderSheet(connection, userIdx);

      const craftLength = craftIdxArr.length;
      let totalCraftPriceArr = [];
      let basicShippingFeeArr = [];

      for (let i=0; i<craftLength; i++){
        const craftIdx = craftIdxArr[i];
        const amount = amountArr[i];

        const craftPrice = await orderDao.getCraftPrice(connection, craftIdx);
        const totalCraftPrice = craftPrice * amount;
        totalCraftPriceArr.push(totalCraftPrice); //총 상품 금액

        const craftBasicShippingFee = await orderDao.getCraftBasicShippingFee(connection, craftIdx, totalCraftPrice);  //상품idx 기본배송비
        basicShippingFeeArr.push(craftBasicShippingFee);

      }

      const totalCraftPrice = totalCraftPriceArr.reduce((pre, cur) => pre + cur);
      const totalBasicShippingFee = basicShippingFeeArr.reduce((pre, cur) => pre + cur);

      await connection.beginTransaction();

      const createOrder = await orderDao.createOrder(connection, userIdx, totalCraftPrice, totalBasicShippingFee);
      const orderIdx = createOrder.insertId;

      for (let i=0; i<craftLength; i++){
        const craftIdx = craftIdxArr[i];
        const amount = amountArr[i];
        const totalCraftPrice = totalCraftPriceArr[i];
        const basicShippingFee = basicShippingFeeArr[i];

        await orderDao.createOrderCraft(connection, orderIdx, craftIdx, amount, totalCraftPrice, basicShippingFee);
      }

      await connection.commit();

      let result = {};
      result.orderIdx = orderIdx;
      result.craft = [];

      for (let i =0; i<craftLength; i++){
        const craftIdx = craftIdxArr[i];
        const craftInfo = await orderDao.getCraftInfo(connection, craftIdx);
        result.craft.push({
          'craftIdx': craftIdx,
          'mainImageUrl': craftInfo.mainImageUrl,
          'name': craftInfo.name,
          'artistIdx': craftInfo.artistIdx,
          'artistName': craftInfo.artistName,
          'price': totalCraftPriceArr[i],
          'amount': amountArr[i]
        });
      }

      result.point = await orderDao.getUserPoint(connection, userIdx);
      result.totalCraftPrice = totalCraftPrice;
      result.totalBasicShippingFee = totalBasicShippingFee;
      result.finalPrice = totalCraftPrice + totalBasicShippingFee;

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`addCraftInOrderSheet DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`addCraftInOrderSheet DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//기존에 적용된 베네핏 삭제
deleteAppliedBenefit = async (connection, orderIdx) => {
  try{
    const appliedBenefit = await orderDao.getAppliedBenefit(connection, orderIdx);
    if (appliedBenefit){
      await connection.beginTransaction();
      await orderDao.deleteAppliedBenefit(connection, orderIdx);
      await connection.commit();
    }

    const result = new appliedBenefitInfo(null, null, null);
    return response(baseResponse.SUCCESS, result);

  }catch(err){
    logger.error(`deleteAppliedBenefit func err: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//베네핏 종류 별 정보 가져오기
getUsedBenefitInfoByType = async (connection, benefitCategoryIdx, orderIdx, benefitIdx) => {
  try{
    let usedBenefitInfo;

    //가격 별 베네핏
    if (benefitCategoryIdx == 1){
      const totalCraftPrice = await orderDao.getTotalCraftPrice(connection, orderIdx);
      usedBenefitInfo = await orderDao.getUsedBenefitByPriceInfo(connection, benefitIdx, totalCraftPrice);
    }
    //작가 별 베네핏
    else if (benefitCategoryIdx == 2){
      const benefitArtistIdx = await orderDao.getBenefitArtistIdx(connection, benefitIdx);
      const orderCraftByArtist = await orderDao.getOrderCraftByArtist(connection, orderIdx);
      
      const totalArtistCraftPrice = orderCraftByArtist.filter(item => item.artistIdx == benefitArtistIdx)[0]['totalArtistCraftPrice'];
      usedBenefitInfo = await orderDao.getUsedBenefitByArtistInfo(connection, benefitIdx, totalArtistCraftPrice);
    }
    //TODO: 상품 별 베네핏
    else if (benefitCategoryIdx == 3){
    }

    return usedBenefitInfo;
  }catch(err){
    logger.error(`getUsedBenefitInfoByType func err: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//새로운 베네핏 적용
applyNewOrderBenefit = async (connection, userIdx, orderIdx, benefitIdx) => {
  try{
    const isUserOrderIdx = await orderDao.isUserOrderIdx(connection, userIdx, orderIdx);
    if (!isUserOrderIdx){
      connection.release();
      return errResponse(baseResponse.NO_PERMISSION);
    }

    const canUseBenefitIdxArr = await getCanUseBenefitIdxArr(connection, userIdx, orderIdx);
    if (!canUseBenefitIdxArr){
      connection.release();
      return errResponse(baseResponse.DB_ERROR);
    }

    if (!canUseBenefitIdxArr.includes(benefitIdx)){
      connection.release();
      return errResponse(baseResponse.CAN_NOT_USE_BENEFIT_IDX);
    }

    const benefitCategoryIdx = await orderDao.getBenefitCategoryIdx(connection, benefitIdx);
    const usedBenefitInfo = await getUsedBenefitInfoByType(connection, benefitCategoryIdx, orderIdx, benefitIdx);
    const benefitTitle = usedBenefitInfo.title;
    const benefitDiscount = usedBenefitInfo.benefitDiscount;

    await connection.beginTransaction();

    //해당 주문 베네핏 적용
    await orderDao.applyOrderSheetBenefit(connection, orderIdx, benefitIdx, benefitDiscount);
    
    let rateInfo; //베네핏 적용해야할 상품들의 적용 비율

    //가격 별 베네핏
    if (benefitCategoryIdx == 1){
      rateInfo = await orderDao.getOrderCraftAllRateInfo(connection, orderIdx);
    }
    //작가 별 베네핏
    else if (benefitCategoryIdx == 2){
      const benefitArtistIdx = await orderDao.getBenefitArtistIdx(connection, benefitIdx);
      rateInfo = await orderDao.getOrderCraftRateInfoByArtist(connection, orderIdx, benefitArtistIdx);
    }
    //TODO: 상품 별 베네핏
    else if (benefitCategoryIdx == 3){
    }

    //부분적(각각 상품 별) 베네핏 적용
    for (let item of rateInfo){
      const orderCraftIdx = item.orderCraftIdx;
      const orderCraftIdxBenefitDiscount = parseInt(item.rate * benefitDiscount);
      await orderDao.applyOrderCraftBenefit(connection, orderCraftIdx, orderCraftIdxBenefitDiscount);
    }

    await connection.commit();

    const result = new appliedBenefitInfo(benefitIdx, benefitTitle, benefitDiscount);
    return response(baseResponse.SUCCESS, result);

  }catch(err){
    logger.error(`applyNewOrderBenefit func err: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//베네핏 적용
exports.applyOrderBenefit = async (userIdx, orderIdx, benefitIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const isExistOrderIdx = await orderDao.isExistOrderIdx(connection, orderIdx);
      if (!isExistOrderIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_IDX);
      }

      const isValidOrderIdx = await orderDao.isValidOrderIdx(connection, orderIdx);
      if (!isValidOrderIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_PAYMENT_ORDER_IDX);
      }

      let result;

      //기존에 적용된 베네핏 삭제
      if (!benefitIdx){
        result = await deleteAppliedBenefit(connection, orderIdx);
      }
      //새로운 베네핏 적용
      else{
        result = await applyNewOrderBenefit(connection, userIdx, orderIdx, benefitIdx);
      }

      connection.release();
      return result;

    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`applyOrderBenefit DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`applyOrderBenefit DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//추가 배송비 적용 및 조회
exports.updateOrderExtraShippingFee = async (userIdx, orderIdx, zipcode) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const isExistOrderIdx = await orderDao.isExistOrderIdx(connection, orderIdx);
      if (!isExistOrderIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_IDX);
      }

      const isValidOrderIdx = await orderDao.isValidOrderIdx(connection, orderIdx);
      if (!isValidOrderIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_PAYMENT_ORDER_IDX);
      }

      const isUserOrderIdx = await orderDao.isUserOrderIdx(connection, userIdx, orderIdx);
      if (!isUserOrderIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }
      
      let totalExtraShippingFee = 0;

      const isExtraFeeZipcode = await orderDao.isExtraFeeZipcode(connection, zipcode);
      if (isExtraFeeZipcode){
        const orderCraftExtraShippingFee = await orderDao.getOrderCraftExtraShippingFee(connection, orderIdx);
        const orderCraftExtraShippingFeeArr =  orderCraftExtraShippingFee.map(item => item.extraShippingFee);
        totalExtraShippingFee = orderCraftExtraShippingFeeArr.reduce((pre, cur) => pre + cur);

        await connection.beginTransaction();
        
        for (let i=0; i<orderCraftExtraShippingFee.length; i++){
          const orderCraftIdx = orderCraftExtraShippingFee[i].orderCraftIdx;
          const extraShippingFee = orderCraftExtraShippingFee[i].extraShippingFee;

          await orderDao.updateOrderCraftExtraShippingFee(connection, orderCraftIdx, extraShippingFee);
        }
        await orderDao.updateOrderExtraShippingFee(connection, orderIdx, totalExtraShippingFee);
        await orderDao.updateOrderZipcode(connection, orderIdx, zipcode);

        await connection.commit();
      }
      else{
        await connection.beginTransaction();
        await orderDao.updateOrderExtraShippingFee(connection, orderIdx, 0);
        await orderDao.updateOrderCraftExtraShippingFeeToFree(connection, orderIdx);
        await orderDao.updateOrderZipcode(connection, orderIdx, zipcode);
        await connection.commit();
      }

      const result = {
        'totalExtraShippingFee': totalExtraShippingFee
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`updateOrderExtraShippingFee DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`updateOrderExtraShippingFee DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//결제 검증
exports.validatePayment = async (userIdx, orderIdx, receiptId) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const isExistOrderIdx = await orderDao.isExistOrderIdx(connection, orderIdx);
      if (!isExistOrderIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_IDX);
      }

      const isValidOrderIdx = await orderDao.isValidOrderIdx(connection, orderIdx);
      if (!isValidOrderIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_PAYMENT_ORDER_IDX);
      }

      const isUserOrderIdx = await orderDao.isUserOrderIdx(connection, userIdx, orderIdx);
      if (!isUserOrderIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const finalPrice = await orderDao.getOrderFinalPrice(connection, orderIdx);

      RestClient.setConfig(
        process.env.BOOTPAY_APPLICATION_ID,
        process.env.BOOTPAY_PRIVATE_KEY
      );
      
      try{
        const response = await RestClient.getAccessToken();
        if (response.status === 200 && response.data.token !== undefined){
          const _response = await RestClient.verify(receiptId);
          if (_response.status === 200){
            if (_response.data.price === finalPrice){
              if (_response.data.status === 1){
                await connection.beginTransaction();
                await orderDao.updateOrderToPaid(connection, orderIdx, receiptId);
                await orderDao.updateBenefitToUsed(connection, userIdx, orderIdx);
                await orderDao.updateUserUsedPoint(connection, userIdx, orderIdx);
                //TODO: 포인트 적립
                await connection.commit();
              }
            }
            else{
              return errResponse(baseResponse.FORGE_PAYMENT);
            }
          }
        }
      }
      catch(err){
        console.log(err);
        if (err.code === -2100){
          return errResponse(baseResponse.INVALID_RECEIPT_ID);
        }
        else{
          return errResponse(baseResponse.SERVER_ERROR);
        }
      }

      connection.release();
      return response(baseResponse.SUCCESS);

    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`validatePayment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`validatePayment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//orderCraftIdx 별 사용 포인트 저장
applyOrderCraftPoint = async (connection, orderIdx, pointDiscount) => {
  try{
    const rateInfo = await orderDao.getOrderCraftAllRateInfo(connection, orderIdx);
    for (let item of rateInfo){
      const orderCraftIdx = item.orderCraftIdx;
      const orderCraftIdxPointDiscount = parseInt(item.rate * pointDiscount);
      await orderDao.applyOrderCraftPoint(connection, orderCraftIdx, orderCraftIdxPointDiscount);
    }

    return true;
  }catch(err){
    logger.error(`applyOrderCraftPoint func err: ${err}`);
    return false;
  }
}

//배송지 정보 및 사용 포인트 저장
exports.updateOrderEtcInfo = async (userIdx, orderIdx, recipient, phone, address, detailAddress, memo, pointDiscount) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const isExistOrderIdx = await orderDao.isExistOrderIdx(connection, orderIdx);
      if (!isExistOrderIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ORDER_IDX);
      }

      const isValidOrderIdx = await orderDao.isValidOrderIdx(connection, orderIdx);
      if (!isValidOrderIdx){
        connection.release();
        return errResponse(baseResponse.ALREADY_PAYMENT_ORDER_IDX);
      }

      const isUserOrderIdx = await orderDao.isUserOrderIdx(connection, userIdx, orderIdx);
      if (!isUserOrderIdx){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const canUsePoint = await orderDao.canUsePoint(connection, userIdx, orderIdx, pointDiscount);
      if (!canUsePoint){
        connection.release();
        return errResponse(baseResponse.INVALID_POINT);
      }

      await connection.beginTransaction();

      //orderT에 배송지 정보, 사용 전체 포인트 저장
      await orderDao.updateOrderEtcInfo(
        connection, orderIdx, recipient, phone, address, detailAddress, memo, pointDiscount
      );
      
      //orderCraftIdx 별 사용 포인트 저장
      const applyPoint = await applyOrderCraftPoint(connection, orderIdx, pointDiscount);
      if (!applyPoint){
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
      }

      //최종 결제 금액 업데이트
      const finalPrice = await orderDao.getFinalPrice(connection, orderIdx);
      await orderDao.updateOrderFinalPrice(connection, orderIdx, finalPrice);
      
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`updateOrderEtcInfo DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`updateOrderEtcInfo DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}