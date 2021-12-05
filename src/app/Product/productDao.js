//유효한 craftIdx인지
async function isExistCraftIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT craftIdx FROM Craft WHERE isDeleted = 'N' && craftIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//상품 기본 정보
async function getCraftBasicInfo(connection, params){
  const query = `
  SELECT C.craftIdx,
        C.name,
        C.price,
        C.mainImageUrl,
        C.content,
        C.size,
        C.isSoldOut,
        C.artistIdx,
        U.nickname                                               as artistName,
        A.introduction                                           as artistIntroduction,
        U.imageUrl                                               as artistImageUrl,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y') as isNew,
        (SELECT COUNT(craftCommentIdx)
          FROM CraftComment CC
          WHERE CC.craftIdx = ? && CC.isDeleted = 'N')          as totalCommentCnt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [params[0], params[0]]);
  return rows[0];
}

//상품 상세 이미지
async function getCraftDetailImage(connection, params){
  const query = `
  SELECT CDI.imageUrl as detailImageUrl
  FROM Craft C
          JOIN CraftDetailImage CDI ON CDI.craftIdx = C.craftIdx && CDI.isDeleted = 'N'
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 유의사항
async function getCraftCautions(connection, params){
  const query = `
  SELECT CC.caution as cautions
  FROM Craft C
          JOIN CraftCaution CC on C.craftIdx = CC.craftIdx && CC.isDeleted = 'N'
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 소재
async function getCraftMaterial(connection, params){
  const query = `
  SELECT CM.material
  FROM Craft C
          JOIN CraftMaterial CM on C.craftIdx = CM.craftIdx && CM.isDeleted = 'N'
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 용도
async function getCraftUsage(connection, params){
  const query = `
  SELECT CUI.name as 'usage'
  FROM Craft C
          JOIN CraftUsage CU on CU.craftIdx = C.craftIdx && CU.isDeleted = 'N'
          JOIN CraftUsageItem CUI on CUI.craftUsageItemIdx = CU.craftUsageItemIdx && CUI.isDeleted = 'N'
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//조건 없이 전체 무료배송인지
async function isFreeShippingFee(connection, params){
  const query = `
  SELECT C.isFreeShipping
  FROM Craft C
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isFreeShipping'];
}

//배송비 조건 있을 경우 배송비
async function getShippingFeeList(connection, params){
  const query = `
  SELECT CONCAT(CSFC.conditions, ' ', IF(CSFC.shippingFee = 0, '무료배송', CONCAT(CSFC.shippingFee, '원'))) as shippingFee
  FROM Craft C
          JOIN CraftShippingFeeCondition CSFC ON CSFC.craftIdx = C.craftIdx && CSFC.isDeleted = 'N'
  WHERE C.craftIdx = ? && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자가 좋아요한 상품인지
async function getUserLikeCraft(connection, params){
  const query = `
  SELECT EXISTS(SELECT *
    FROM CraftLike
    WHERE craftIdx = ? && userIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

module.exports = {
  isExistCraftIdx,
  getCraftBasicInfo,
  getCraftDetailImage,
  getCraftCautions,
  getCraftMaterial,
  getCraftUsage,
  isFreeShippingFee,
  getShippingFeeList,
  getUserLikeCraft,
}