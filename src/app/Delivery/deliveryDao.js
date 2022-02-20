const {ORDER_STATUS} = require('../../../modules/constants');

//존재하는 orderCraftIdx인지
async function isExistOrderCraftIdx(connection, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT orderCraftIdx
    FROM OrderCraft
    WHERE orderCraftIdx = ${orderCraftIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//작가의 orderCraftIdx인지
async function isArtistOrderCraftIdx(connection, artistIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT OC.craftIdx, C.artistIdx
      FROM OrderCraft OC
              JOIN Craft C ON C.craftIdx = OC.craftIdx
      WHERE OC.orderCraftIdx = ${orderCraftIdx} && C.artistIdx = ${artistIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//발송정보 입력 가능한 상태인지
async function canCreateSendingInfo(connection, orderCraftIdx){
  const query = `
  SELECT IF(orderStatusIdx = ${ORDER_STATUS.READY_FOR_DELIVERY}, 1, 0) AS canCreate
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['canCreate'];
}

//발송정보 입력
async function createSendingInfo(connection, orderCraftIdx, sentAt, tCode, tInvoice){
  const query = `
  UPDATE OrderCraft
  SET tCode    = ?,
      tInvoice = ?,
      sentAt   = ?
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query, [tCode, tInvoice, sentAt]);
  return rows;
}

//발송 후 orderCraft 상태 변경
async function updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx, deliveryStatusIdx){
  const query = `
  UPDATE OrderCraft
  SET orderStatusIdx    = ${orderStatusIdx},
      deliveryStatusIdx = ${deliveryStatusIdx}
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//발송정보 입력했는지
async function isEnteredDeliveryInfo(connection, orderCraftIdx){
  const query = `
  SELECT IF(tInvoice IS NULL, 0, 1) as isExist
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx}
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//발송정보 가져오기
async function getSendingInfo(connection, orderCraftIdx){
  const query = `
  SELECT YEAR(sentAt) as year, MONTH(sentAt) as month, DAY(sentAt) as day, tCode, tInvoice
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유저의 orderCraftIdx인지
async function isUserOrderCraftIdx(connection, userIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT O.orderIdx
      FROM OrderCraft OC
              JOIN OrderT O ON OC.orderIdx = O.orderIdx
      WHERE OC.orderCraftIdx = ${orderCraftIdx} && O.userIdx = ${userIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//배송 현황 조회
async function getTrackingInfo(connection, orderCraftIdx){
  const query = `
  SELECT location,
        kind,
        createdAt                          AS originalCreatedAt,
        DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
        DATE_FORMAT(createdAt, '%H:%i:%S') AS timeString
  FROM TrackingInfo
  WHERE orderCraftIdx = ${orderCraftIdx}
  ORDER BY originalCreatedAt DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistOrderCraftIdx,
  isArtistOrderCraftIdx,
  canCreateSendingInfo,
  createSendingInfo,
  updateOrderCraftStatus,
  isEnteredDeliveryInfo,
  getSendingInfo,
  isUserOrderCraftIdx,
  getTrackingInfo,
}