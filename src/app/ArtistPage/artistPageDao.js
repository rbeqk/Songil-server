const {
  ORDER_STATUS, ORDER_CANCEL_REASON, ORDER_RETURN_REASON, ORDER_CANCEL_RETURN_STATUS
} = require("../../../modules/constants");

//작가 craft 관한 orderCraftIdx인지
async function isArtistOrderCraftIdx(connection, artistIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT OC.orderCraftIdx
      FROM OrderCraft OC
              JOIN Craft C ON OC.craftIdx = C.craftIdx
      WHERE OC.orderCraftIdx = ${orderCraftIdx} && C.artistIdx = ${artistIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//주문자 정보 확인
async function getOrderCraftUserInfo(connection, orderCraftIdx){
  const query = `
  SELECT OC.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                    as artistName,
        OC.totalCraftPrice                            AS price,
        OC.amount,
        O.recipient,
        O.phone,
        CONCAT('(', O.zipcode, ')', O.address, ' ', O.detailAddress) as address,
        O.memo
  FROM OrderCraft OC
          JOIN Craft C ON OC.craftIdx = C.craftIdx
          JOIN OrderT O ON OC.orderIdx = O.orderIdx
          JOIN Artist A ON C.artistIdx = A.artistIdx
          JOIN User U ON A.userIdx = U.userIdx
  WHERE OC.orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//작가관련 주문현황 총 개수(=날짜 개수) 가져오기
async function getBasicOrderListCnt(connection, artistIdx){
  const query = `
  SELECT COUNT(DISTINCT DATE(O.createdAt)) AS totalCnt
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
  WHERE C.artistIdx = ${artistIdx} &&
        OC.orderCraftIdx NOT IN (${ORDER_STATUS.REQUEST_CANCEL}, ${ORDER_STATUS.REQUEST_RETURN}, ${ORDER_STATUS.CALCEL_COMPLETED});
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

///반품/취소 요청 현황 총 개수(=날짜 개수) 가져오기
async function getCancelOrReturnListCnt(connection, artistIdx){
  const query = `
  SELECT COUNT(T.date) AS totalCnt
  FROM (SELECT DISTINCT DATE(OCAN.reqCreatedAt) AS date
        FROM OrderCancel OCAN
                JOIN OrderCraft OC ON OC.orderCraftIdx = OCAN.orderCraftIdx
                JOIN Craft C ON C.craftIdx = OC.craftIdx
        WHERE C.artistIdx = ${artistIdx}
        UNION
        SELECT DISTINCT DATE(ORE.reqCreatedAt) AS date
        FROM OrderReturn ORE
                JOIN OrderCraft OC ON OC.orderCraftIdx = ORE.orderCraftIdx
                JOIN Craft C ON C.craftIdx = OC.craftIdx
        WHERE C.artistIdx = ${artistIdx}) T;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//작가관련 주문현황 날짜 가져오기
async function getBasicOrderCreatedAtArr(connection, artistIdx, startItemIdx, itemsPerPage){
  const query = `
  SELECT DISTINCT DATE_FORMAT(O.createdAt, '%Y.%m.%d') AS date
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
  WHERE C.artistIdx = ${artistIdx} &&
        OC.orderCraftIdx NOT IN (${ORDER_STATUS.REQUEST_CANCEL}, ${ORDER_STATUS.REQUEST_RETURN})
  ORDER BY date
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.date);
}

//주문현황 날짜 별 정보 가져오기
async function getBasicOrderInfo(connection, artistIdx, createdAt){
  const query = `
  SELECT OC.orderCraftIdx     AS orderDetailIdx,
        OC.deliveryStatusIdx AS status,
        OC.craftIdx,
        C.mainImageUrl,
        C.name,
        O.userIdx,
        U.nickname AS userName
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
          JOIN User U ON U.userIdx = O.userIdx
  WHERE DATE(O.createdAt) = ? && OC.orderCraftIdx IN (SELECT OC.orderCraftIdx
                                                                FROM OrderCraft OC
                                                                          JOIN OrderT O ON O.orderIdx = OC.orderIdx
                                                                          JOIN Craft C ON C.craftIdx = OC.craftIdx
                                                                WHERE C.artistIdx = ${artistIdx} &&
                                                                      OC.orderCraftIdx NOT IN
                                                                      (${ORDER_STATUS.REQUEST_CANCEL}, ${ORDER_STATUS.REQUEST_RETURN}))
  ORDER BY OC.orderCraftIdx DESC;
  `;
  const [rows] = await connection.query(query, createdAt);
  return rows;
}

//작가관련 반품/취소 요청 현황 날짜 가져오기
async function getcancelOrReturnOrderCreatedAtArr(connection, artistIdx, startItemIdx, itemsPerPage){
  const query = `
  SELECT T.date
  FROM (SELECT DISTINCT DATE_FORMAT(OCAN.reqCreatedAt, '%Y.%m.%d') AS date
        FROM OrderCancel OCAN
                JOIN OrderCraft OC ON OC.orderCraftIdx = OCAN.orderCraftIdx
                JOIN Craft C ON C.craftIdx = OC.craftIdx
        WHERE C.artistIdx = ${artistIdx}
        UNION
        SELECT DISTINCT DATE_FORMAT(ORE.reqCreatedAt, '%Y.%m.%d') AS date
        FROM OrderReturn ORE
                JOIN OrderCraft OC ON OC.orderCraftIdx = ORE.orderCraftIdx
                JOIN Craft C ON C.craftIdx = OC.craftIdx
        WHERE C.artistIdx = ${artistIdx}) T
  ORDER BY T.date
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.date);
}

//작가관련 반품/취소 날짜 별 정보 가져오기
async function getcancelOrReturnOrderInfo(connection, artistIdx, createdAt){
  const query = `
  SELECT OCAN.orderCraftIdx                                                      AS orderDetailIdx,
        IFNULL(OCAN.resStatusIdx, ${ORDER_CANCEL_RETURN_STATUS.REQUEST_CANCEL}) AS status,
        C.craftIdx,
        C.mainImageUrl,
        C.name,
        O.userIdx,
        U.nickname                                                              AS userName,
        IF(OCAN.orderCancelReasonIdx = ${ORDER_CANCEL_REASON.ETC_REASON}, OCAN.etcReason,
            OCR.reason)                                                          AS reason,
        IF(OCAN.resStatusIdx, 'N', 'Y')                                         AS canChangeStatus,
        OCAN.reqCreatedAt                                                       AS compareCreatedAt
  FROM OrderCancel OCAN
          JOIN OrderCraft OC ON OC.orderCraftIdx = OCAN.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
          JOIN User U ON U.userIdx = O.userIdx
          JOIN OrderCancelReason OCR ON OCR.orderCancelReasonIdx = OCAN.orderCancelReasonIdx
  WHERE C.artistIdx = ${artistIdx} && DATE(OCAN.reqCreatedAt) = ?
  UNION ALL
  SELECT ORE.orderCraftIdx                                                      AS orderDetailIdx,
        IFNULL(ORE.resStatusIdx, ${ORDER_CANCEL_RETURN_STATUS.REQUEST_RETURN}) AS status,
        C.craftIdx,
        C.mainImageUrl,
        C.name,
        O.userIdx,
        U.nickname                                                             AS userName,
        IF(ORE.orderReturnReasonIdx = ${ORDER_RETURN_REASON.ETC_REASON}, ORE.etcReason,
            ORR.reason)                                                      AS reason,
        IF(ORE.resStatusIdx, 'N', 'Y')                                         AS canChangeStatus,
        ORE.reqCreatedAt                                                       AS compareCreatedAt
  FROM OrderReturn ORE
          JOIN OrderCraft OC ON OC.orderCraftIdx = ORE.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
          JOIN User U ON U.userIdx = O.userIdx
          JOIN OrderReturnReason ORR on ORE.orderReturnReasonIdx = ORR.orderReturnReasonIdx
  WHERE C.artistIdx = ${artistIdx} && DATE(ORE.reqCreatedAt) = ?
  ORDER BY compareCreatedAt DESC;
  `;
  const [rows] = await connection.query(query, [createdAt, createdAt]);
  return rows;
}

module.exports = {
  isArtistOrderCraftIdx,
  getOrderCraftUserInfo,
  getBasicOrderListCnt,
  getCancelOrReturnListCnt,
  getBasicOrderCreatedAtArr,
  getBasicOrderInfo,
  getcancelOrReturnOrderCreatedAtArr,
  getcancelOrReturnOrderInfo,
}