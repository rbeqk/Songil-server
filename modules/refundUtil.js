const RestClient = require('@bootpay/server-rest-client').RestClient;
require('dotenv').config();
const {RES_STATUS, ORDER_STATUS, BOOTPAY_RETURN_TYPE} = require('./constants');
const orderCancelDao = require('../src/app/OrderCancel/orderCancelDao');
const orderReturnDao = require('../src/app/OrderReturn/orderReturnDao');
const orderStatusDao = require('../src/app/OrderStatus/orderStatusDao');

const pointDiscountInfoUpdate = async (connection, userIdx, pointDiscount) => {
  if (pointDiscount > 0){
    await orderStatusDao.updateUserPointByCancel(connection, userIdx, pointDiscount);
  }
}

const benefitDiscountInfoUpdate = async (connection, orderCraftIdx, benefitDiscount) => {
  if (benefitDiscount > 0){
    const isUpdateBenefitInfo = await orderStatusDao.isUpdateBenefitInfo(connection, orderCraftIdx);
    if (isUpdateBenefitInfo){
      await orderStatusDao.updateBenefitInfo(connection, orderCraftIdx);
    }
  }
}

const bootPayRefund = async (connection, orderCraftIdx, type, refundInfo) => {
  RestClient.setConfig(
    process.env.BOOTPAY_APPLICATION_ID,
    process.env.BOOTPAY_PRIVATE_KEY
  );

  const resStatusIdx = RES_STATUS.APPROVAL;

  try{
    const response = await RestClient.getAccessToken();
    if (response.status === 200 && response.data.token !== undefined){
      const refund = await RestClient.cancel({
        receiptId: refundInfo.receiptId,
        price: refundInfo.finalRefundPrice,
        name: refundInfo.nickname,
        reason: refundInfo.reason
      });

      if (refund.status === 200){
        console.log(refund.data);
        const refundReceiptId = refund.data.receipt_id;

        if (type === BOOTPAY_RETURN_TYPE.CANCEL){
          const orderStatusIdx = ORDER_STATUS.CALCEL_COMPLETED;

          await connection.beginTransaction();

          await orderCancelDao.resOrderCraftCancel(connection, orderCraftIdx, resStatusIdx);
          await orderCancelDao.updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx, resStatusIdx);
          await orderCancelDao.createRefundInfo(connection, refundInfo.orderCancelIdx, refundReceiptId, refundInfo.finalRefundPrice);

          await pointDiscountInfoUpdate(connection, refundInfo.userIdx, refundInfo.pointDiscount);
          await benefitDiscountInfoUpdate(connection, orderCraftIdx, refundInfo.benefitDiscount);

          await connection.commit();
          return [true, null];
        }
        else if (type === BOOTPAY_RETURN_TYPE.RETURN){
          const orderStatusIdx = ORDER_STATUS.RETURN_COMPLELTED;

          await connection.beginTransaction();

          await orderReturnDao.resOrderCraftReturn(connection, orderCraftIdx, resStatusIdx);
          await orderReturnDao.updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx, resStatusIdx);
          await orderReturnDao.createRefundInfo(connection, refundInfo.orderReturnIdx, refundReceiptId, refundInfo.finalRefundPrice);

          await pointDiscountInfoUpdate(connection, refundInfo.userIdx, refundInfo.pointDiscount);
          await benefitDiscountInfoUpdate(connection, orderCraftIdx, refundInfo.benefitDiscount);

          await connection.commit();
          return [true, null];
        }
      }
      else{
        console.log(err);
        return [false, err.message];
      }
    }
  }catch(err){
    console.log(err);
    return [false, err.message];
  }
}

module.exports = {
  bootPayRefund,
}