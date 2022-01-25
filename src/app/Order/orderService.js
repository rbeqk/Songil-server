const orderDao = require('./orderDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getCanUseBenefitIdxArr} = require('../../../modules/benefitUtil');
const RestClient = require('@bootpay/server-rest-client').RestClient;

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

      //해당 베네핏의 category
      const benefitCategoryIdx = await orderDao.getBenefitCategoryIdx(connection, benefitIdx);

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

      const benefitTitle = usedBenefitInfo.title;
      const benefitDiscount = usedBenefitInfo.benefitDiscount;

      await connection.beginTransaction();
      await orderDao.applyOrderSheetBenefit(connection, orderIdx, benefitIdx, benefitDiscount);
      await connection.commit();

      const result = {
        'benefitIdx': benefitIdx,
        'title': benefitTitle,
        'discountPrice': benefitDiscount
      }
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

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

      RestClient.getAccessToken().then(async (response) => {
        if (response.status === 200 && response.data.token !== undefined){
          RestClient.verify(receiptId).then(async (_response) => {
            if (_response.status === 200){
              if (_response.data.price === finalPrice && _response.data.status === 1){
                await connection.beginTransaction();
                await orderDao.updateOrderToPaid(connection, orderIdx, receiptId);
                await orderDao.updateBenefitToUsed(connection, orderIdx);
                //TODO: 포인트 적립
                await connection.commit();
              }
            }
          });
        }
      });

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