const schedule = require('node-schedule');
const {pool} = require('../config/database');
const {logger} = require('../config/winston');
const {response, errResponse} = require('../config/response');
const {ORDER_STATUS, DELIVERY_STATUS} = require('./constants');
const axios = require('axios');
require('dotenv').config();

const getUpdateOrderCraft = async (connection) => {
  const query = `
  SELECT orderCraftIdx, tCode, tInvoice FROM OrderCraft
  WHERE tInvoice IS NOT NULL;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

const getOrderCraftDeliveryLen = async (connection, orderCraftIdx) => {
  const query = `
  SELECT COUNT(trackingInfoIdx) AS totalCnt
  FROM TrackingInfo
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

const addTrackingInfo = async (connection, orderCraftIdx, time, where, kind) => {
  const query = `
  INSERT INTO TrackingInfo (orderCraftIdx, location, kind, createdAt)
  VALUES (${orderCraftIdx}, ?, ?, ?);
  `;
  await connection.query(query, [where, kind, time]);
}

const updateOrderCraftDeliveryStatus = async (connection, orderCraftIdx, deliveryCompltedTime) => {
  const query = `
  UPDATE OrderCraft
  SET orderStatusIdx    = ${ORDER_STATUS.DELIVERY_COMPLETED},
      deliveryStatusIdx = ${DELIVERY_STATUS.DELIVERY_COMPLETED},
      deliveryCompltedTime = ?
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  await connection.query(query, [deliveryCompltedTime]);
}

const TrackingSchedule = schedule.scheduleJob('0 0-15/1 * * 1-6', async () => {
  console.log(new Date());
  console.log(`TrackingSchedule: ${new Date()}`);
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const updateOrderCraft = await getUpdateOrderCraft(connection);
      
      for (let item of updateOrderCraft){
        const orderCraftIdx = item.orderCraftIdx;
        const tCode = item.tCode;
        const tInvoice = item.tInvoice;

        const deliveryInfo = await axios('https://info.sweettracker.co.kr/api/v1/trackingInfo', {
          params: {
            t_key: process.env.SWEET_TRACKER_KEY,
            t_code: tCode,
            t_invoice: tInvoice
          }
        });

        if (deliveryInfo.data?.code){
          logger.error(deliveryInfo.data.msg);
        }

        const trackingDetails = deliveryInfo.data.trackingDetails;
        const completeYN = deliveryInfo.data.completeYN;

        const orderCraftDeliveryLen = await getOrderCraftDeliveryLen(connection, orderCraftIdx);

        if (trackingDetails.length > orderCraftDeliveryLen){
          if (completeYN === 'Y'){
            const deliveryCompltedTime = trackingDetails[trackingDetails.length - 1].timsString;
            await updateOrderCraftDeliveryStatus(connection, orderCraftIdx, deliveryCompltedTime);
          }

          for (let i = orderCraftDeliveryLen; i < trackingDetails.length; i++){
            const time = trackingDetails[i].timeString;
            const where = trackingDetails[i].where;
            const kind = trackingDetails[i].kind;

            await addTrackingInfo(connection, orderCraftIdx, time, where, kind);
          }
        }
      };

      connection.release();
    }
    catch(err){
      connection.release();
      logger.error(`Schedule Error: ${err}`);
    }
  }catch(err){
    logger.error(`Schedule DB Connection Error: ${err}`);
  }
});