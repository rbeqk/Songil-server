const {ORDER_STATUS} = require('../../../modules/constants');

//주문취소할 수 있는 상태인지
async function canCancelOrderCraft(connection, orderCraftIdx){
  const query = `
  SELECT IF(orderStatusIdx = ${ORDER_STATUS.READY_FOR_DELIVERY}, 1, 0) AS canCancel
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['canCancel'];
}

//주문취소 요청
async function reqOrderCraftCancel(connection, orderCraftIdx, reasonIdx, etcReason){
  const query = `
  INSERT INTO OrderCancel (orderCraftIdx, orderCancelReasonIdx, etcReason)
  VALUES (${orderCraftIdx}, ${reasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
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
  canCancelOrderCraft,
  reqOrderCraftCancel,
  updateOrderCraftStatus,
}