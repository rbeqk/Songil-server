const {ORDER_STATUS, POINT_INFO, ORDER_RETURN_REASON} = require('../../../modules/constants');

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

//반품 취소 승인 및 거부 가능한 상태인지
async function canResReturnOrderCraft(connection, orderCraftIdx){
  const query = `
  SELECT IF(orderStatusIdx = ${ORDER_STATUS.REQUEST_RETURN}, 1, 0) AS canRes
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['canRes'];
}

//반품요청에 관한 작가 응답 반영
async function resOrderCraftReturn(connection, orderCraftIdx, resStatusIdx){
  const query = `
  UPDATE OrderReturn
  SET resStatusIdx = ${resStatusIdx},
      resCreatedAt = NOW()
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//반품 관련 정보
async function getReturnInfo(connection, orderCraftIdx){
  const query = `
  SELECT ORE.orderReturnIdx,
        U.userIdx,
        U.nickname,
        O.receiptId,
        OC.orderIdx,
        OC.totalCraftPrice + OC.basicShippingFee + OC.extraShippingFee -
        (OC.pointDiscount + OC.benefitDiscount) AS finalRefundPrice,
        OC.pointDiscount,
        OC.benefitDiscount,
        CASE
            WHEN orderReturnReasonIdx = ${ORDER_RETURN_REASON.CHANGE_OF_HEART} THEN '단순 변심'
            WHEN orderReturnReasonIdx = ${ORDER_RETURN_REASON.DAMAGED_DURING_DELIVERY} THEN '배송 중 파손'
            WHEN orderReturnReasonIdx = ${ORDER_RETURN_REASON.GUIDE_FROM_ARTIST} THEN '작가로부터 안내받음'
            WHEN orderReturnReasonIdx = ${ORDER_RETURN_REASON.ETC_REASON} THEN etcReason
            END                                 AS reason
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN User U ON U.userIdx = O.userIdx
          JOIN OrderReturn ORE ON ORE.orderCraftIdx = OC.orderCraftIdx
  WHERE OC.orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//환불 정보 넣기
async function createRefundInfo(connection, orderReturnIdx, receiptId, finalRefundPrice){
  const query = `
  INSERT INTO Refund (orderReturnIdx, receiptId, finalRefundPrice)
  VALUES (${orderReturnIdx}, ?, ${finalRefundPrice});
  `;
  const [rows] = await connection.query(query, [receiptId]);
  return rows;
}

//반품으로 인한 포인트 정보 업데이트
async function updateUserPointByReturn(connection, userIdx, pointDiscount){
  const pointStatusQuery = `
  INSERT INTO PointStatus(userIdx, point, pointInfoIdx)
  VALUES (${userIdx}, ${pointDiscount}, ${POINT_INFO.RETURNED_POINT_BY_RETURN});
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

//반품으로 인한 베네핏 정보 업데이트
async function updateBenefitStatus(connection, orderCraftIdx){
  const getOrderCntQuery = `
  SELECT COUNT(orderCraftIdx) AS totalOrderCnt
  FROM OrderCraft
  WHERE orderIdx = (SELECT orderIdx
                    FROM OrderCraft
                    WHERE orderCraftIdx = ${orderCraftIdx});
  `;

  let [rows] = await connection.query(getOrderCntQuery);
  const totalOrderCnt = rows[0]['totalOrderCnt'];

  //결제 시 해당 orderCraftIdx만 결제했을 경우 => 베네핏 돌려주기
  if (totalOrderCnt === 1){
    const getBenefitIdxQuery = `
    SELECT benefitIdx
    FROM OrderT
    WHERE orderIdx = (SELECT orderIdx
                      FROM OrderCraft
                      WHERE orderCraftIdx = ${orderCraftIdx});
    `;
    [rows] = await connection.query(getBenefitIdxQuery);
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
}

module.exports = {
  canReturnOrderCraft,
  reqOrderCraftReturn,
  updateOrderCraftStatus,
  isArtistOrderCraft,
  canResReturnOrderCraft,
  resOrderCraftReturn,
  getReturnInfo,
  createRefundInfo,
  updateUserPointByReturn,
  updateBenefitStatus,
}