//총 포토 리뷰 개수
async function getOnlyPhotoReviewCnt(connection, params){
  const query = `
  SELECT COUNT(productReviewIdx) as totalReviewCnt FROM ProductReview
  WHERE productIdx = ? && isDeleted = 'N' && isPhotoReview = 'Y'
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalReviewCnt'];
}

//총 리뷰 개수
async function getReviewCnt(connection, params){
  const query = `
  SELECT COUNT(productIdx) as totalReviewCnt FROM ProductReview
  WHERE productIdx = ? && isDeleted = 'N'
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalReviewCnt'];
}

//상품 포토 리뷰 전체 가져오기
async function getReviewInfoOnlyPhoto(connection, params){
  const query = `
  SELECT PR.productReviewIdx,
        U.userIdx,
        U.nickname,
        DATE_FORMAT(PR.createdAt, '%Y.%m.%d') as createdAt,
        PR.content,
        PR.isReported
  FROM ProductReview PR
          JOIN User U ON U.userIdx = PR.userIdx
  WHERE PR.productIdx = ? && PR.isDeleted = 'N' && PR.isPhotoReview = 'Y'
  ORDER BY PR.productReviewIdx
  LIMIT ?, ?
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 리뷰 전체 가져오기
async function getReviewInfo(connection, params){
  const query = `
  SELECT PR.productReviewIdx,
        U.userIdx,
        U.nickname,
        DATE_FORMAT(PR.createdAt, '%Y.%m.%d') as createdAt,
        PR.content,
        PR.isReported
  FROM ProductReview PR
          JOIN User U ON U.userIdx = PR.userIdx
  WHERE PR.productIdx = ? && PR.isDeleted = 'N'
  ORDER BY PR.productReviewIdx
  LIMIT ?, ?
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//리뷰 별 사진 가져오기
async function getReviewPhoto(connection, params){
  const query = `
  SELECT imageUrl FROM ProductReviewImage
  WHERE productReviewIdx = ? && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//존재하는 상품 리뷰 idx인지
async function isExistProductReviewIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT productReviewIdx
    FROM ProductReview
    WHERE isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//사용자가 기존에 신고한 상품 리뷰 idx인지
async function isExistUserReportedReviewIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReportedProductReview
    WHERE userIdx = ? && productReviewIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//리뷰 신고
async function reportReview(connection, params){
  const query = `
  INSERT INTO ReportedProductReview(userIdx, productReviewIdx, reportedProductReasonIdx, etcContent)
  VALUES (?, ?, ?, ?)
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  getOnlyPhotoReviewCnt,
  getReviewCnt,
  getReviewInfoOnlyPhoto,
  getReviewInfo,
  getReviewPhoto,
  isExistProductReviewIdx,
  isExistUserReportedReviewIdx,
  reportReview,
}