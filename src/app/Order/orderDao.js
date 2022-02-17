const {POINT_INFO} = require('../../../modules/constants');

//기존에 주문 안한 주문서 내역 다 삭제
async function deleteUserNotPaidOrderSheet(connection, userIdx){
  const getDeleteOrderIdxQuery = `
  SELECT orderIdx FROM OrderT
  WHERE userIdx = ${userIdx} && isPaid = 'N';
  `
  const [getDeleteOrderIdx] = await connection.query(getDeleteOrderIdxQuery);
  const deleteOrderIdx = getDeleteOrderIdx[0]?.orderIdx;

  if (deleteOrderIdx){
    const deleteOrderTQuery = `
    DELETE FROM OrderT
    WHERE orderIdx = ${deleteOrderIdx} && isPaid = 'N';
    `;
    await connection.query(deleteOrderTQuery);

    const deleteOrderCraftQuery = `
    DELETE FROM OrderCraft
    WHERE orderIdx = ${deleteOrderIdx};
    `;
    await connection.query(deleteOrderCraftQuery);
  }
}

//존재&&품절X 상품 idx 개수
async function getExistCraftIdxLen(connection, craftIdxArr){
  const query = `
  SELECT COUNT(craftIdx) as totalCnt FROM Craft
  WHERE isDeleted = 'N' && isSoldOut = 'N' && craftIdx IN (?);
  `;
  const [rows] = await connection.query(query, [craftIdxArr]);
  return rows[0]['totalCnt'];
}

//상품 가격 가져오기
async function getCraftPrice(connection, craftIdx){
  const query = `
  SELECT price FROM Craft
  WHERE craftIdx = ${craftIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['price'];
}

//상품 기본 배송비 가져오기
async function getCraftBasicShippingFee(connection, craftIdx, totalCraftPrice){
  const query = `
  SELECT IF(toFreeShippingFee IS NULL,
      basicShippingFee,
      IF(${totalCraftPrice} >= toFreeShippingFee, 0, basicShippingFee)) as basicShippingFee FROM Craft
  WHERE craftIdx = ${craftIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['basicShippingFee'];
}

//주문 생성
async function createOrder(connection, userIdx, totalCraftPrice, totalBasicShippingFee){
  const query = `
  INSERT INTO OrderT(userIdx, totalCraftPrice, totalBasicShippingFee)
  VALUES (${userIdx}, ${totalCraftPrice}, ${totalBasicShippingFee});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//주문 상품 생성
async function createOrderCraft(connection, orderIdx, craftIdx, amount, totalCraftPrice, basicShippingFee){
  const query = `
  INSERT INTO OrderCraft(orderIdx, craftIdx, amount, totalCraftPrice, basicShippingFee)
  VALUES (${orderIdx}, ${craftIdx}, ${amount}, ${totalCraftPrice}, ${basicShippingFee});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 정보 가져오기
async function getCraftInfo(connection, craftIdx){
  const query = `
  SELECT C.craftIdx, C.mainImageUrl, C.name, C.artistIdx, U.nickname as artistName
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유저 포인트 가져오기
async function getUserPoint(connection, userIdx){
  const query = `
  SELECT point FROM User
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['point'];
}

//존재하는 orderIdx인지
async function isExistOrderIdx(connection, orderIdx){
  const query = `
  SELECT EXISTS(SELECT orderIdx FROM OrderT WHERE orderIdx = ${orderIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//아직 결제완료하지 않은 orderIdx인지
async function isValidOrderIdx(connection, orderIdx){
  const query = `
  SELECT EXISTS(SELECT orderIdx FROM OrderT WHERE orderIdx = ${orderIdx} && isPaid = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//유저의 orderIdx인지
async function isUserOrderIdx(connection, userIdx, orderIdx){
  const query = `
  SELECT EXISTS(SELECT * FROM OrderT WHERE userIdx = ${userIdx} && orderIdx = ${orderIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//해당 주문의 totalCraftPrice 가져오기
async function getTotalCraftPrice(connection, orderIdx){
  const query = `
  SELECT totalCraftPrice FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCraftPrice'];
}

//해당 베네핏의 카테고리 가져오기
async function getBenefitCategoryIdx(connection, benefitIdx){
  const query = `
  SELECT benefitCategoryIdx FROM Benefit
  WHERE benefitIdx = ${benefitIdx} && deadline > NOW() && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['benefitCategoryIdx'];
}

//사용한 가격 별 베네핏 정보 가져오기
async function getUsedBenefitByPriceInfo(connection, benefitIdx, totalCraftPrice){
  const query = `
  SELECT B.benefitIdx,
        B.title,
        IF(B.discountPrice IS NOT NULL,
            B.discountPrice,
            IF(B.discountPercent/100 * ${totalCraftPrice} >= B.maxDiscountPrice,
              B.maxDiscountPrice,
              FLOOR(B.discountPercent/100 * ${totalCraftPrice}))) as benefitDiscount
  FROM Benefit B
          LEFT JOIN Artist A ON A.artistIdx = B.artistIdx && A.isDeleted = 'N'
          LEFT JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE B.benefitIdx = ${benefitIdx} && B.deadline > NOW() && B.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//베네핏 작가 idx 가져오기
async function getBenefitArtistIdx(connection, benefitIdx){
  const query = `
  SELECT artistIdx FROM Benefit
  WHERE benefitIdx = ${benefitIdx} && deadline > NOW() && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['artistIdx'];
}

//작가 별 총 구매 금액
async function getOrderCraftByArtist(connection, orderIdx){
  const query = `
  SELECT A.artistIdx, SUM(O.totalCraftPrice) as totalArtistCraftPrice
  FROM OrderCraft O
          JOIN Craft C ON O.craftIdx = C.craftIdx && C.isDeleted = 'N' && C.isSoldOut = 'N'
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
  WHERE O.orderIdx = ${orderIdx}
  GROUP BY A.artistIdx;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작가 별 베네핏 정보 가져오기
async function getUsedBenefitByArtistInfo(connection, benefitIdx, totalArtistCraftPrice){
  const query = `
  SELECT B.benefitIdx,
        CONCAT(U.nickname, ' 작가 전용 베네핏')                                  as title,
        IF(B.discountPrice IS NOT NULL,
            B.discountPrice,
            IF(B.discountPercent / 100 * ${totalArtistCraftPrice} >= B.maxDiscountPrice,
              B.maxDiscountPrice,
              FLOOR(B.discountPercent / 100 * ${totalArtistCraftPrice}))) as benefitDiscount
  FROM Benefit B
          LEFT JOIN Artist A ON A.artistIdx = B.artistIdx && A.isDeleted = 'N'
          LEFT JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE B.benefitIdx = ${benefitIdx} && B.deadline > NOW() && B.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//해당 주문에 베네핏 적용
async function applyOrderSheetBenefit(connection, orderIdx, benefitIdx, benefitDiscount){
  const query = `
  UPDATE OrderT
  SET benefitDiscount = ${benefitDiscount},
      benefitIdx = ${benefitIdx}
  WHERE orderIdx = ${orderIdx}
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//산간지역인 우편번호인지
async function isExtraFeeZipcode(connection, zipcode){
  const query = `
  SELECT EXISTS(SELECT zipcode FROM ExtraFeeZipCode WHERE zipcode = ${zipcode}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//orderCraftIdx 별 extraShippingFee 가져오기
async function getOrderCraftExtraShippingFee(connection, orderIdx){
  const query = `
  SELECT OC.orderCraftIdx, C.extraShippingFee FROM OrderCraft OC
  JOIN Craft C ON C.craftIdx = OC.craftIdx && C.isDeleted = 'N' && C.isSoldOut = 'N'
  WHERE OC.orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderCraftIdx extraShippingFee 적용
async function updateOrderCraftExtraShippingFee(connection, orderCraftIdx, extraShippingFee){
  const query = `
  UPDATE OrderCraft
  SET extraShippingFee = ${extraShippingFee}
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderIdx totalExtraShippingFee 적용
async function updateOrderExtraShippingFee(connection, orderIdx, totalExtraShippingFee){
  const query = `
  UPDATE OrderT
  SET totalExtraShippingFee = ${totalExtraShippingFee}
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderCraftIdx extraShippingFee = 0으로 적용
async function updateOrderCraftExtraShippingFeeToFree(connection, orderIdx){
  const query = `
  UPDATE OrderCraft
  SET extraShippingFee = 0
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderIdx zipcode 적용
async function updateOrderZipcode(connection, orderIdx, zipcode){
  const query = `
  UPDATE OrderT
  SET zipcode = ${zipcode}
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderIdx 최종 결제 금액 가져오기
async function getOrderFinalPrice(connection, orderIdx){
  const query = `
  SELECT finalPrice FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['finalPrice'];
}

//결제 완료로 변경
async function updateOrderToPaid(connection, orderIdx, receiptId){
  const query = `
  UPDATE OrderT
  SET isPaid = 'Y',
      receiptId = ?,
      paymentCreatedAt = NOW()
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query, [receiptId]);
  return rows;
}

//베네핏 사용 처리
async function updateBenefitToUsed(connection, userIdx, orderIdx){
  const getBenefitIdxQuery = `
  SELECT benefitIdx FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [getBenefitIdx] = await connection.query(getBenefitIdxQuery);
  const benefitIdx = getBenefitIdx[0]?.benefitIdx;

  if (benefitIdx){
    const query = `
    UPDATE UserBenefit
    SET isUsed = 'Y',
        usedAt = NOW()
    WHERE userIdx = ${userIdx} && benefitIdx = ${benefitIdx};
    `;
    const [rows] = await connection.query(query);
    return rows;
  }
}

//사용자가 사용할 수 있는 포인트인지
async function canUsePoint(connection, userIdx, orderIdx, pointDiscount){
  const getCurFinalPriceQuery = `
  SELECT totalCraftPrice + totalBasicShippingFee + totalExtraShippingFee - benefitDiscount as curFinalPrice
  FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [getCurFinalPrice] = await connection.query(getCurFinalPriceQuery);
  const curFinalPrice = getCurFinalPrice[0]['curFinalPrice'];

  if (curFinalPrice < pointDiscount){
    return false;
  }

  const query = `
  SELECT IF(${pointDiscount} > point , 0, 1) as canUsePoint FROM User
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['canUsePoint'];
}

//배송정보 및 사용 포인트 저장
async function updateOrderEtcInfo(connection, orderIdx, recipient, phone, address, detailAddress, memo, pointDiscount){
  const query = `
  UPDATE OrderT
  SET recipient = ?,
      phone = ?,
      address = ?,
      detailAddress = ?,
      memo = ?,
      pointDiscount = ${pointDiscount}
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query, [recipient, phone, address, detailAddress, memo]);
  return rows;
}

//orderIdx의 최종 결제 금액 가져오기
async function getFinalPrice(connection, orderIdx){
  const query = `
  SELECT totalCraftPrice + totalBasicShippingFee + totalExtraShippingFee - (benefitDiscount + pointDiscount) as finalPrice
  FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['finalPrice'];
}

//상품 구매시 사용 포인트 차감
async function updateUserUsedPoint(connection, userIdx, orderIdx){
  const getPointDiscountQuery = `
  SELECT pointDiscount FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [getPointDiscount] = await connection.query(getPointDiscountQuery);
  const pointDiscount = getPointDiscount[0]['pointDiscount'];

  if (pointDiscount > 0){
    const updatePointStatusQuery = `
    INSERT INTO PointStatus (userIdx, point, pointInfoIdx)
    VALUES (${userIdx}, -${pointDiscount}, ${POINT_INFO.USED_POINT_WHEN_PAYING});
    `;
    await connection.query(updatePointStatusQuery);

    const updateUserPointQuery = `
    UPDATE User
    SET point = point - ${pointDiscount}
    WHERE userIdx = ${userIdx};
    `;
    await connection.query(updateUserPointQuery);
  }
}

//orderIdx의 최종 결제 금액 추가
async function updateOrderFinalPrice(connection, orderIdx, finalPrice){
  const query = `
  UPDATE OrderT
  SET finalPrice = ${finalPrice}
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//기존에 적용된 베네핏 가져오기
async function getAppliedBenefit(connection, orderIdx){
  const query = `
  SELECT benefitIdx FROM OrderT
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]?.benefitIdx;
}

//기존에 적용된 베네핏 삭제
async function deleteAppliedBenefit(connection, orderIdx){
  const deleteOrderTBenefitQuery = `
  UPDATE OrderT
  SET benefitIdx = null,
      benefitDiscount = 0
  WHERE orderIdx = ${orderIdx};
  `;
  await connection.query(deleteOrderTBenefitQuery);

  const deleteOrderCraftBenefitQuery = `
  UPDATE OrderCraft
  SET benefitDiscount = 0
  WHERE orderIdx = ${orderIdx};
  `;
  await connection.query(deleteOrderCraftBenefitQuery);
}

//orderIdx 별 orderCraftIdx들의 비율 가져오기
async function getOrderCraftAllRateInfo(connection, orderIdx){
  const query = `
  SELECT OC.orderIdx,
        OC.orderCraftIdx,
        OC.totalCraftPrice AS eachTotalCraftPrice,
        O.totalCraftPrice,
        OC.totalCraftPrice / O.totalCraftPrice AS rate
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = ${orderIdx}
  WHERE OC.orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//베네핏 사용 시 비율마다 orderCraft의 베네핏 적용
async function applyOrderCraftBenefit(connection, orderCraftIdx, orderCraftIdxBenefitDiscount){
  const query = `
  UPDATE OrderCraft
  SET benefitDiscount = ${orderCraftIdxBenefitDiscount}
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작가 별 베네핏 사용 시 해당 작가 별 비율
async function getOrderCraftRateInfoByArtist(connection, orderIdx, benefitArtistIdx){
  const query = `
    SELECT OC.orderCraftIdx,
        OC.orderIdx,
        OC.craftIdx,
        OC.totalCraftPrice / (SELECT SUM(OC.totalCraftPrice)
                              FROM OrderCraft OC
                                        JOIN Craft C ON C.craftIdx = OC.craftIdx
                              WHERE OC.orderIdx = ${orderIdx}
                              GROUP BY C.artistIdx
                              HAVING C.artistIdx = ${benefitArtistIdx}) AS rate
  FROM OrderCraft OC
          JOIN Craft C ON C.craftIdx = OC.craftIdx && C.artistIdx = ${benefitArtistIdx}
  WHERE OC.orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//orderCraft 별 포인트 적용
async function applyOrderCraftPoint(connection, orderCraftIdx, orderCraftIdxPointDiscount){
  const query = `
  UPDATE OrderCraft
  SET pointDiscount = ${orderCraftIdxPointDiscount}
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//주문한 craftIdx 가져오기
async function getCraftIdxByOrderIdx(connection, orderIdx){
  const query = `
  SELECT craftIdx FROM OrderCraft
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.craftIdx);
}

module.exports = {
  deleteUserNotPaidOrderSheet,
  getExistCraftIdxLen,
  getCraftPrice,
  getCraftBasicShippingFee,
  createOrder,
  createOrderCraft,
  getCraftInfo,
  getUserPoint,
  isExistOrderIdx,
  isValidOrderIdx,
  isUserOrderIdx,
  getTotalCraftPrice,
  getBenefitCategoryIdx,
  getUsedBenefitByPriceInfo,
  getBenefitArtistIdx,
  getOrderCraftByArtist,
  getUsedBenefitByArtistInfo,
  applyOrderSheetBenefit,
  isExtraFeeZipcode,
  getOrderCraftExtraShippingFee,
  updateOrderCraftExtraShippingFee,
  updateOrderCraftExtraShippingFeeToFree,
  updateOrderExtraShippingFee,
  updateOrderZipcode,
  getOrderFinalPrice,
  updateOrderToPaid,
  updateBenefitToUsed,
  canUsePoint,
  updateOrderEtcInfo,
  getFinalPrice,
  updateUserUsedPoint,
  updateOrderFinalPrice,
  getAppliedBenefit,
  deleteAppliedBenefit,
  getOrderCraftAllRateInfo,
  applyOrderCraftBenefit,
  getOrderCraftRateInfoByArtist,
  applyOrderCraftPoint,
  getCraftIdxByOrderIdx,
}