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
        IF(B.discountPrice IS NOT NULL, NULL,
            CONCAT(B.basisPrice, '원 이상 구매시, 최대 ', B.maxDiscountPrice, '원 할인')) as detailInfo,
        DATE_FORMAT(B.deadline, '%m.%d')                                   as deadline
  FROM UserBenefit UB
          JOIN Benefit B ON B.benefitIdx = UB.benefitIdx && B.deadline > NOW() && B.isDeleted = 'N'
          LEFT JOIN Artist A ON A.artistIdx = B.artistIdx && A.isDeleted = 'N'
          LEFT JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE UB.userIdx = ${userIdx}
  ORDER BY B.benefitIdx DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getBenefits,
}