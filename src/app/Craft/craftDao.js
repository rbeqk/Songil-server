const {CRAFT_USAGE_CATEGORY} = require('../../../modules/constants');

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
        (SELECT COUNT(CC.craftCommentIdx) AS totalCnt
          FROM CraftComment CC
                  JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          WHERE CC.isDeleted = 'N' && OC.craftIdx = ${craftIdx})  as totalCommentCnt
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
  return rows.map(item => item.detailImageUrl);
}

//상품 유의사항
async function getCraftCautions(connection, craftIdx){
  const query = `
  SELECT CC.caution as cautions
  FROM Craft C
          JOIN CraftCaution CC on C.craftIdx = CC.craftIdx
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.cautions);
}

//상품 소재
async function getCraftMaterial(connection, craftIdx){
  const query = `
  SELECT CM.material
  FROM Craft C
          JOIN CraftMaterial CM on C.craftIdx = CM.craftIdx
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.material);;
}

//상품 용도
async function getCraftUsage(connection, craftIdx){
  const query = `
  SELECT IF(CUI.craftUsageItemIdx IN (${CRAFT_USAGE_CATEGORY.TABLE_WARE_ETC}, ${CRAFT_USAGE_CATEGORY.HOME_DECO_ETC},
    ${CRAFT_USAGE_CATEGORY.JEWELRY_ETC}, ${CRAFT_USAGE_CATEGORY.ETC_ETC}),
  CU.etcUsage,
  CUI.name) as 'usage'
  FROM Craft C
  JOIN CraftUsage CU on CU.craftIdx = C.craftIdx
  JOIN CraftUsageItem CUI on CUI.craftUsageItemIdx = CU.craftUsageItemIdx
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.usage);
}

//배송비 관련 정보
async function getCraftShippingFee(connection, craftIdx){
  const query = `
  SELECT CONCAT('배송비 ', basicShippingFee, '원') as basicShippingFee,
        IF(toFreeShippingFee, CONCAT(toFreeShippingFee, '원 이상 주문 시 무료'), NULL) as toFreeShippingFee,
        IF(extraShippingFee != 0, CONCAT('도서 산간 지역 ', extraShippingFee, '원 추가'), NULL) as extraShippingFee
  FROM Craft
  WHERE isDeleted = 'N' && craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//사용자의 좋아요 여부 가져오기
async function getUserLikeCraft(connection, userIdx, craftIdx){
  const query = `
  SELECT IF(EXISTS(SELECT *
    FROM CraftLike
    WHERE userIdx = ${userIdx} && craftIdx = ${craftIdx}), 'Y', 'N') as isLike;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isLike'];
}

//작가의 상품 전체 삭제
async function deleteUserCraft(connection, artistIdx){
  const query = `
  UPDATE Craft
  SET isDeleted = 'Y'
  WHERE artistIdx = ${artistIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistCraftIdx,
  getCraftBasicInfo,
  getCraftDetailImage,
  getCraftCautions,
  getCraftMaterial,
  getCraftUsage,
  getCraftShippingFee,
  getUserLikeCraft,
  deleteUserCraft,
}