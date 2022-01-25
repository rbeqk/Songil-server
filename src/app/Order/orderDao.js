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
  WHERE benefitIdx = ${benefitIdx} && isUsed = 'N' && deadline > NOW() && isDeleted = 'N';
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
  WHERE B.benefitIdx = ${benefitIdx} && B.isUsed = 'N' && B.deadline > NOW() && B.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//베네핏 작가 idx 가져오기
async function getBenefitArtistIdx(connection, benefitIdx){
  const query = `
  SELECT artistIdx FROM Benefit
  WHERE benefitIdx = ${benefitIdx} && isUsed = 'N' && deadline > NOW() && isDeleted = 'N';
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
  WHERE B.benefitIdx = ${benefitIdx} && B.isUsed = 'N' && B.deadline > NOW() && B.isDeleted = 'N';
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

async function updateOrderZipcode(connection, orderIdx, zipcode){
  const query = `
  UPDATE OrderT
  SET zipcode = ${zipcode}
  WHERE orderIdx = ${orderIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
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
  updateOrderExtraShippingFee,
  updateOrderZipcode,
}