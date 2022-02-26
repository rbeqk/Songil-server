const {ORDER_STATUS} = require("../../../modules/constants");

//존재하는 orderCraftIdx인지
async function isExistOrderCraftIdx(connection, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM OrderCraft OC
            JOIN OrderT O ON O.orderIdx = OC.orderIdx
    WHERE OC.orderCraftIdx = ${orderCraftIdx} && O.isPaid = 'Y') AS isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//유저의 orderCraftIdx인지
async function isUserOrderOrderCraftIdx(connection, userIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT OC.orderCraftIdx
    FROM OrderCraft OC
            JOIN OrderT O ON O.orderIdx = OC.orderIdx
    WHERE OC.orderCraftIdx = ${orderCraftIdx} && O.userIdx = ${userIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//결제 상세 정보 가져오기
async function getOrderDetail(connection, orderCraftIdx){
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
        CONCAT('(', O.zipcode, ')', ' ', O.address, ' ', O.detailAddress) as address,
        O.memo,
        OC.totalCraftPrice,
        OC.basicShippingFee,
        OC.extraShippingFee,
        OC.pointDiscount,
        OC.benefitDiscount,
        OC.totalCraftPrice + OC.basicShippingFee + OC.extraShippingFee
            - (OC.pointDiscount + OC.benefitDiscount) AS finalPrice
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

//유저의 order 정보 가져오기
async function getUserOrderInfoArr(connection, userIdx, startItemIdx, itemsPerPage){
  const query = `
  SELECT orderIdx, DATE_FORMAT(paymentCreatedAt, '%Y.%m.%d') as createdAt
  FROM OrderT
  WHERE userIdx = ${userIdx} && isPaid = 'Y'
  ORDER BY orderIdx DESC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderCraft 정보 가져오기
async function getOrderCraftInfoArr(connection, orderIdx){
  const query = `
  SELECT OC.orderCraftIdx                                                  AS orderDetailIdx,
        OC.orderStatusIdx                                                 AS status,
        OC.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                                        AS artistName,
        OC.totalCraftPrice                                                AS price,
        OC.amount,
        IF(orderStatusIdx = ${ORDER_STATUS.READY_FOR_DELIVERY}, 'Y', 'N') AS canReqCancel,
        IF(orderStatusIdx = ${ORDER_STATUS.DELIVERY_COMPLETED}, 'Y', 'N') AS canReqReturn,
        IF(orderStatusIdx = ${ORDER_STATUS.DELIVERY_COMPLETED}, 'Y', 'N') AS canWriteComment
  FROM OrderCraft OC
          JOIN Craft C ON OC.craftIdx = C.craftIdx
          JOIN Artist A ON C.artistIdx = A.artistIdx
          JOIN User U ON A.userIdx = U.userIdx
  WHERE OC.orderIdx = ${orderIdx}
  ORDER BY orderCraftIdx;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistOrderCraftIdx,
  isUserOrderOrderCraftIdx,
  getOrderDetail,
  getUserOrderInfoArr,
  getOrderCraftInfoArr,
}