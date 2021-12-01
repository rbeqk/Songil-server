//유효한 productIdx인지
async function isExistProductIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT productIdx FROM Product WHERE isDeleted = 'N' && productIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//상품 기본 정보
async function getProductBasicInfo(connection, params){
  const query = `
  SELECT P.productIdx,
        P.name,
        P.price,
        P.mainImageUrl,
        P.content,
        P.size,
        P.isSoldOut,
        P.artistIdx,
        U.nickname as artistName,
        A.introduction as artistIntroduction,
        U.imageUrl as artistImageUrl,
        IF(TIMESTAMPDIFF(DAY, P.createdAt, NOW()) > 3, 'N', 'Y') as isNew,
        (SELECT COUNT(productReviewIdx) as totalReviewCnt FROM ProductReview PR WHERE PR.productIdx = ? && PR.isDeleted = 'N') as totalReviewCnt
  FROM Product P
          JOIN Artist A ON A.artistIdx = P.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE P.productIdx = ? && P.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [params[0], params[0]]);
  return rows[0];
}

//상품 상세 이미지
async function getProductDetailImage(connection, params){
  const query = `
  SELECT PDI.imageUrl as detailImageUrl FROM Product P
  JOIN ProductDetailImage PDI ON PDI.productIdx = P.productIdx && PDI.isDeleted = 'N'
  WHERE P.productIdx = ? && P.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 유의사항
async function getProductCautions(connection, params){
  const query = `
  SELECT PC.caution as cautions FROM Product P
  JOIN ProductCaution PC on P.productIdx = PC.productIdx && PC.isDeleted = 'N'
  WHERE P.productIdx = ? && P.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 소재
async function getProductMaterial(connection, params){
  const query = `
  SELECT PM.material FROM Product P
  JOIN ProductMaterial PM on P.productIdx = PM.productIdx && PM.isDeleted = 'N'
  WHERE P.productIdx = ? && P.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 용도
async function getProductUsage(connection, params){
  const query = `
  SELECT PUI.name as 'usage' FROM Product P
  JOIN ProductUsage PU on PU.productIdx = P.productIdx && PU.isDeleted = 'N'
  JOIN ProductUsageItem PUI on PUI.productUsageItemIdx = PU.productUsageItemIdx && PUI.isDeleted = 'N'
  WHERE P.productIdx = ? && P.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//조건 없이 전체 무료배송인지
async function isFreeShippingFee(connection, params){
  const query = `
  SELECT P.isFreeShipping FROM Product P
  WHERE P.productIdx = ? && P.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isFreeShipping'];
}

//배송비 조건 있을 경우 배송비
async function getShippingFeeList(connection, params){
  const query = `
  SELECT CONCAT(PSFC.conditions, ' ', IF(PSFC.shippingFee=0, '무료배송', CONCAT(PSFC.shippingFee, '원'))) as shippingFee FROM Product P
  JOIN ProductShippingFeeCondition PSFC ON PSFC.productIdx = P.productIdx && PSFC.isDeleted = 'N'
  WHERE P.productIdx = ? && P.isDeleted = 'N'
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자가 좋아요한 상품인지
async function getUserLikeProduct(connection, params){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ProductLike
    WHERE productIdx = ? && userIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

module.exports = {
  isExistProductIdx,
  getProductBasicInfo,
  getProductDetailImage,
  getProductCautions,
  getProductMaterial,
  getProductUsage,
  isFreeShippingFee,
  getShippingFeeList,
  getUserLikeProduct,
}