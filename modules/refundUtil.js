const RestClient = require('@bootpay/server-rest-client').RestClient;
require('dotenv').config();
const {RES_STATUS, ORDER_STATUS, BOOTPAY_RETURN_TYPE} = require('./constants');
const orderCancelDao = require('../src/app/OrderCancel/orderCancelDao');
const orderReturnDao = require('../src/app/OrderReturn/orderReturnDao');

const bootPayRefund = async (connection, orderCraftIdx, type, refundInfo) => {
  console.log(refundInfo.finalRefundPrice)
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
          await orderCancelDao.updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx);
          await orderCancelDao.createRefundInfo(connection, refundInfo.orderCancelIdx, refundReceiptId, refundInfo.finalRefundPrice);
  
          if (refundInfo.pointDiscount > 0){
            await orderCancelDao.updateUserPointByCancel(connection, refundInfo.userIdx, refundInfo.pointDiscount);
          }
  
          if (refundInfo.benefitDiscount > 0){
            await orderCancelDao.updateBenefitStatus(connection, orderCraftIdx);
          }

          await connection.commit();
          return [true, null];
        }
        else if (type === BOOTPAY_RETURN_TYPE.RETURN){
          const orderStatusIdx = ORDER_STATUS.RETURN_COMPLELTED;

          await connection.beginTransaction();

          await orderReturnDao.resOrderCraftReturn(connection, orderCraftIdx, resStatusIdx);
          await orderReturnDao.updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx);
          await orderReturnDao.createRefundInfo(connection, refundInfo.orderReturnIdx, refundReceiptId, refundInfo.finalRefundPrice);

          if (refundInfo.pointDiscount > 0){
            await orderReturnDao.updateUserPointByReturn(connection, refundInfo.userIdx, refundInfo.pointDiscount);
          }

          if (refundInfo.benefitDiscount > 0){
            await orderReturnDao.updateBenefitStatus(connection, orderCraftIdx);
          }

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