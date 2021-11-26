//총 포토 리뷰 개수
async function getOnlyPhotoReviewCnt(connection, params){
  const query = `
  SELECT COUNT(productReviewIdx) as totalReviewCnt FROM ProductReview
  WHERE isDeleted = 'N' && isPhotoReview = 'Y'
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

module.exports = {
  getOnlyPhotoReviewCnt,
  getReviewCnt,
  getReviewInfoOnlyPhoto,
  getReviewInfo,
  getReviewPhoto,
}