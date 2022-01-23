const orderDao = require('./orderDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.addCraftInOrderSheet = async (userIdx, craftIdxArr, amountArr) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재&&품절X 상품 idx인지
      const isNotExistOrSoldOutCraftIdx = await orderDao.isNotExistOrSoldOutCraftIdx(connection, craftIdxArr);
      if (isNotExistOrSoldOutCraftIdx) return res.send(errResponse(baseResponse.INVALID_CRAFT_IDX));

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
      connection.release();
      logger.error(`addCraftInOrderSheet DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`addCraftInOrderSheet DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}