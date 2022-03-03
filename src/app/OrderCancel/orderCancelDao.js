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
async function updateOrderCraftStatus(connection, orderCraftIdx, orderStatusIdx, resStatusIdx){
  const query = `
  UPDATE OrderCraft
  SET orderStatusIdx = ${orderStatusIdx},
      resStatusIdx   = ${resStatusIdx}
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작가의 orderCraft인지
async function isArtistOrderCraft(connection, artistIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT OC.orderCraftIdx
      FROM OrderCraft OC
              JOIN Craft C ON OC.craftIdx = C.craftIdx
      WHERE OC.orderCraftIdx = ${orderCraftIdx} && C.artistIdx = ${artistIdx}) AS isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//주문취소 승인 및 거부 가능한 상태인지
async function canResCancelOrderCraft(connection, orderCraftIdx, type){
  let query;
  if (type === 'rejection'){
    query = `
    SELECT IF(orderStatusIdx = ${ORDER_STATUS.REQUEST_CANCEL}, 1, 0) AS canRes
    FROM OrderCraft
    WHERE orderCraftIdx = ${orderCraftIdx};
    `;
  }
  else if (type === 'approval'){
    query = `
    SELECT IF(orderStatusIdx = ${ORDER_STATUS.REQUEST_CANCEL}, 1, 0) AS canRes
    FROM OrderCraft
    WHERE orderCraftIdx = ${orderCraftIdx};
    `;
  }
  const [rows] = await connection.query(query);
  return rows[0]['canRes'];
}

//주문취소에 관한 작가 응답 반영
async function resOrderCraftCancel(connection, orderCraftIdx, resStatusIdx){
  const query = `
  UPDATE OrderCancel
  SET resStatusIdx = ${resStatusIdx},
      resCreatedAt = NOW()
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//취소 관련 정보
async function getCancelInfo(connection, orderCraftIdx){
  const query = `
  SELECT OCN.orderCancelIdx,
        U.userIdx,
        U.nickname,
        O.receiptId,
        OC.orderIdx,
        OC.totalCraftPrice + OC.basicShippingFee + OC.extraShippingFee -
        (OC.pointDiscount + OC.benefitDiscount) AS finalRefundPrice,
        OC.pointDiscount,
        OC.benefitDiscount,
        CASE
            WHEN orderCancelReasonIdx = 1 THEN '단순 변심'
            WHEN orderCancelReasonIdx = 2 THEN '옵션 선택 실수'
            WHEN orderCancelReasonIdx = 3 THEN '작가로부터 따로 안내 받음'
            WHEN orderCancelReasonIdx = 4 THEN '재주문 예정'
            WHEN orderCancelReasonIdx = 5 THEN etcReason
            END                                 AS reason
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN User U ON U.userIdx = O.userIdx
          JOIN OrderCancel OCN ON OC.orderCraftIdx = OCN.orderCraftIdx
  WHERE OC.orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//환불 정보 넣기
async function createRefundInfo(connection, orderCancelIdx, receiptId, finalRefundPrice){
  const query = `
  INSERT INTO Refund (orderCancelIdx, receiptId, finalRefundPrice)
  VALUES (${orderCancelIdx}, ?, ${finalRefundPrice});
  `;
  const [rows] = await connection.query(query, [receiptId]);
  return rows;
}

module.exports = {
  canCancelOrderCraft,
  reqOrderCraftCancel,
  updateOrderCraftStatus,
  isArtistOrderCraft,
  canResCancelOrderCraft,
  resOrderCraftCancel,
  getCancelInfo,
  createRefundInfo,
}