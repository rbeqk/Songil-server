//유효한 craftIdx인지
async function isExistCraftIdx(connection, craftIdx){
  const query = `
  SELECT EXISTS(SELECT craftIdx FROM Craft WHERE isDeleted = 'N' && craftIdx = ${craftIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//상품 기본 정보
async function getCraftBasicInfo(connection, craftIdx){
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
          WHERE CC.craftIdx = ${craftIdx} && CC.isDeleted = 'N')          as totalCommentCnt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//상품 상세 이미지
async function getCraftDetailImage(connection, craftIdx){
  const query = `
  SELECT CDI.imageUrl as detailImageUrl
  FROM Craft C
          JOIN CraftDetailImage CDI ON CDI.craftIdx = C.craftIdx && CDI.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 유의사항
async function getCraftCautions(connection, craftIdx){
  const query = `
  SELECT CC.caution as cautions
  FROM Craft C
          JOIN CraftCaution CC on C.craftIdx = CC.craftIdx && CC.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 소재
async function getCraftMaterial(connection, craftIdx){
  const query = `
  SELECT CM.material
  FROM Craft C
          JOIN CraftMaterial CM on C.craftIdx = CM.craftIdx && CM.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 용도
async function getCraftUsage(connection, craftIdx){
  const query = `
  SELECT CUI.name as 'usage'
  FROM Craft C
          JOIN CraftUsage CU on CU.craftIdx = C.craftIdx && CU.isDeleted = 'N'
          JOIN CraftUsageItem CUI on CUI.craftUsageItemIdx = CU.craftUsageItemIdx && CUI.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//배송비 관련 정보
async function getCraftShippingFee(connection, craftIdx){
  const query = `
  SELECT CONCAT('배송비 ', basicShippingFee, '원') as basicShippingFee,
        IF(toFreeShippingFee, CONCAT(toFreeShippingFee, '원 이상 주문 시 무료'), NULL) as toFreeShippingFee,
        IF(extraShippingFee, CONCAT('도서 산간 지역 ', extraShippingFee, '원 추가'), NULL) as extraShippingFee
  FROM Craft
  WHERE isDeleted = 'N' && craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

module.exports = {
  isExistCraftIdx,
  getCraftBasicInfo,
  getCraftDetailImage,
  getCraftCautions,
  getCraftMaterial,
  getCraftUsage,
  getCraftShippingFee,
}