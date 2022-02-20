const {ORDER_STATUS, POINT_INFO} = require('../../../modules/constants');

//반품 가능한 상황인지
async function canReturnOrderCraft(connection, orderCraftIdx){
  const query = `
  SELECT IF(orderStatusIdx = ${ORDER_STATUS.DELIVERY_COMPLETED}, 1, 0) AS canReturn
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['canReturn'];
}

//반품 요청
async function reqOrderCraftReturn(connection, orderCraftIdx, reasonIdx, etcReason){
  const query = `
  INSERT INTO OrderReturn (orderCraftIdx, orderReturnReasonIdx, etcReason)
  VALUES (${orderCraftIdx}, ${reasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows
}

//orderCraft 상태 변경
async function updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx){
  const query = `
  UPDATE OrderCraft
  SET orderStatusIdx = ${orderStatusIdx}
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  canReturnOrderCraft,
  reqOrderCraftReturn,
  updateOrderCraftStatus,
}