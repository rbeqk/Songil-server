const {ORDER_STATUS, COMMENT_BTN_STATUS, POINT_INFO, RES_STATUS} = require("../../../modules/constants");

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
        IF(orderStatusIdx = ${ORDER_STATUS.DELIVERY_COMPLETED},
            IF((SELECT EXISTS(SELECT CC.craftCommentIdx
                              FROM CraftComment CC
                              WHERE CC.orderCraftIdx = OC.orderCraftIdx && CC.isDeleted = 'N')),
              ${COMMENT_BTN_STATUS.COMPLETED_COMMENT}, ${COMMENT_BTN_STATUS.COMMENT_ACTIVATED}),
            ${COMMENT_BTN_STATUS.COMMENT_DISABLED})                        AS commentBtnStatus
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

//환불로 인한 포인트 정보 업데이트
async function updateUserPointByCancel(connection, userIdx, pointDiscount){
  const pointStatusQuery = `
  INSERT INTO PointStatus(userIdx, point, pointInfoIdx)
  VALUES (${userIdx}, ${pointDiscount}, ${POINT_INFO.RETURNED_POINT_BY_CANCEL});
  `;
  await connection.query(pointStatusQuery);

  const getPointQuery = `
  SELECT SUM(point) AS totalPoint
  FROM PointStatus
  WHERE userIdx = ${userIdx};
  `;
  const [getPoint] = await connection.query(getPointQuery);
  const totalPoint = getPoint[0]['totalPoint'];

  const userPointQuery = `
  UPDATE User
  SET point = ${totalPoint}
  WHERE userIdx = ${userIdx};
  `;
  await connection.query(userPointQuery);
}

//주문취소로 인한 베네핏 정보 업데이트 여부
async function isUpdateBenefitInfo(connection, orderCraftIdx){
  const getOrderCraftCntQuery = `
  SELECT COUNT(orderCraftIdx) AS totalOrderCaftCnt
  FROM OrderCraft
  WHERE orderIdx = (SELECT orderIdx
                    FROM OrderCraft
                    WHERE orderCraftIdx = ${orderCraftIdx});
  `;
  let [rows] = await connection.query(getOrderCraftCntQuery);

  const orderCraftCnt = rows[0]['totalOrderCaftCnt'];
  if (orderCraftCnt === 1){
    return true;
  }
  else{
    const isOtherOrderCraftIdxReturnedQuery = `
    SELECT OC.orderCraftIdx, OC.resStatusIdx
    FROM OrderCraft OC
    WHERE orderIdx = (SELECT orderIdx
                      FROM OrderCraft
                      WHERE orderCraftIdx = ${orderCraftIdx})
              && OC.orderCraftIdx != ${orderCraftIdx};
    `;
    [rows] = await connection.query(isOtherOrderCraftIdxReturnedQuery);
    const isOtherOrderCraftIdxReturned = rows.filter(item => item.orderStatusIdx === RES_STATUS.REJECTION).length > 0 ? false : true;
    
    return isOtherOrderCraftIdxReturned ? true : false;
  }
}

//주문취소로 인한 베네핏 정보 업데이트
async function updateBenefitInfo(connection, orderCraftIdx){
  const getBeneiftIdxQuery = `
  SELECT benefitIdx
    FROM OrderT
    WHERE orderIdx = (SELECT orderIdx
                      FROM OrderCraft
                      WHERE orderCraftIdx = ${orderCraftIdx});
  `;
  let [rows] = await connection.query(getBeneiftIdxQuery);
  const benefitIdx = rows[0]['benefitIdx'];

  const getUserIdxQuery = `
  SELECT O.userIdx
    FROM OrderCraft OC
            JOIN OrderT O ON OC.orderIdx = O.orderIdx
    WHERE OC.orderCraftIdx = ${orderCraftIdx};
  `;
  [rows] = await connection.query(getUserIdxQuery);
  const userIdx = rows[0]['userIdx'];

  const updateBenefitQuery = `
    UPDATE UserBenefit
    SET isUsed = 'N',
        usedAt = NULL
    WHERE userIdx = ${userIdx} && benefitIdx = ${benefitIdx} && isDeleted = 'N';
  `;
  await connection.query(updateBenefitQuery);
}

module.exports = {
  isExistOrderCraftIdx,
  isUserOrderOrderCraftIdx,
  getOrderDetail,
  getUserOrderInfoArr,
  getOrderCraftInfoArr,
  updateUserPointByCancel,
  isUpdateBenefitInfo,
  updateBenefitInfo,
}