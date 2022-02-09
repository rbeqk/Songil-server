//보유 베네핏 조회
async function getBenefits(connection, userIdx){
  const query = `
  SELECT UB.benefitIdx,
        B.imageUrl,
        IF(B.discountPrice IS NOT NULL,
            CONCAT(B.discountPrice, '원 할인'),
            CONCAT(B.discountPercent, '% 할인'))                                 as discountInfo,
        CASE
            WHEN B.benefitCategoryIdx = 1 THEN B.title
            WHEN B.benefitCategoryIdx = 2 THEN CONCAT(U.nickname, ' 작가 전용 베네핏')
            WHEN B.benefitCategoryIdx = 3 THEN NULL
          END                                                               as title,
        IF(B.discountPrice IS NOT NULL,
            (CONCAT(B.basisPrice, '원 이상 구매 시')),
            CONCAT(B.basisPrice, '원 이상 구매 시, 최대 ', B.maxDiscountPrice, '원 할인')) as detailInfo,
        DATE_FORMAT(B.deadline, '%m.%d')                                   as deadline
  FROM UserBenefit UB
          JOIN Benefit B ON B.benefitIdx = UB.benefitIdx && B.deadline > NOW() && B.isDeleted = 'N'
          LEFT JOIN Artist A ON A.artistIdx = B.artistIdx && A.isDeleted = 'N'
          LEFT JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE UB.userIdx = ${userIdx} && UB.isUsed = 'N' && UB.isDeleted = 'N'
  ORDER BY B.benefitIdx DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//존재하는 orderIdx인지
async function isExistOrderIdx(connection, orderIdx){
  const query = `
  SELECT EXISTS(SELECT orderIdx FROM OrderT WHERE orderIdx = ${orderIdx}) as isExist;
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

//유저의 사용 가능한 모든 베네핏(없을 경우 유효하지 않은 값으로)
async function getUserAllBenefitIdxArr(connection, userIdx){
  const query = `
  SELECT UB.benefitIdx
  FROM UserBenefit UB
          JOIN Benefit B ON B.benefitIdx = UB.benefitIdx && B.isDeleted = 'N' && deadline > NOW()
  WHERE UB.userIdx = ${userIdx} && UB.isUsed = 'N' && UB.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows.length > 0 ? rows.map(item => item.benefitIdx) : [-1];
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

//사용할 수 있는 가격 별 쿠폰
async function getCanUseBenefitIdxArrByPrice(connection, totalCraftPrice, userAllBenefitIdxArr){
  const query = `
  SELECT benefitIdx
  FROM Benefit
  WHERE benefitIdx IN (?) && benefitCategoryIdx = 1 && basisPrice <= ${totalCraftPrice} &&
        deadline > NOW() && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [userAllBenefitIdxArr]);
  return rows.map(item => item.benefitIdx);
}

//작가별 총 구매 금액
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

//사용할 수 있는 작가 별 쿠폰
async function getCanUseBenefitIdxArrByArtist(connection, artistIdx, totalArtistCraftPrice, userAllBenefitIdxArr){
  const query = `
  SELECT benefitIdx
  FROM Benefit
  WHERE benefitIdx IN (?) && benefitCategoryIdx = 2 && artistIdx = ${artistIdx} && basisPrice <= ${totalArtistCraftPrice} &&
      deadline > NOW() && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [userAllBenefitIdxArr]);
  return rows.map(item => item.benefitIdx);
}

//사용할 수 있는 가격 별 + 작가 별 쿠폰 정보
async function getCanUseBenefitInfo(connection, canUseBenefitIdxArr){
  const query = `
  SELECT B.benefitIdx,
        B.imageUrl,
        IF(B.discountPrice IS NOT NULL,
            CONCAT(B.discountPrice, '원 할인'),
            CONCAT(B.discountPercent, '% 할인'))                                 as discountInfo,
        CASE
            WHEN B.benefitCategoryIdx = 1 THEN B.title
            WHEN B.benefitCategoryIdx = 2 THEN CONCAT(U.nickname, ' 작가 전용 베네핏')
            WHEN B.benefitCategoryIdx = 3 THEN NULL
            END                                                               as title,
        IF(B.discountPrice IS NOT NULL,
            (CONCAT(B.basisPrice, '원 이상 구매 시')),
            CONCAT(B.basisPrice, '원 이상 구매시, 최대 ', B.maxDiscountPrice, '원 할인')) as detailInfo,
        DATE_FORMAT(B.deadline, '%m.%d')                                      as deadline
  FROM Benefit B
          LEFT JOIN Artist A ON A.artistIdx = B.artistIdx && A.isDeleted = 'N'
          LEFT JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE B.benefitIdx IN (?) && B.isDeleted = 'N' && B.deadline > NOW() && B.isDeleted = 'N'
  ORDER BY B.benefitIdx DESC;
  `;
  const [rows] = await connection.query(query, [canUseBenefitIdxArr]);
  return rows;
}

//아직 결제완료하지 않은 orderIdx인지
async function isValidOrderIdx(connection, orderIdx){
  const query = `
  SELECT EXISTS(SELECT orderIdx FROM OrderT WHERE orderIdx = ${orderIdx} && isPaid = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

module.exports = {
  getBenefits,
  isExistOrderIdx,
  isUserOrderIdx,
  getUserAllBenefitIdxArr,
  getTotalCraftPrice,
  getCanUseBenefitIdxArrByPrice,
  getOrderCraftByArtist,
  getCanUseBenefitIdxArrByArtist,
  getCanUseBenefitInfo,
  isValidOrderIdx,
}