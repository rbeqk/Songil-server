//총 포토 댓글 개수
async function getOnlyPhotoCommentCnt(connection, params){
  const query = `
  SELECT COUNT(craftCommentIdx) as totalCommentCnt
  FROM CraftComment
  WHERE craftIdx = ? && isDeleted = 'N' && isPhotoComment = 'Y';
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCommentCnt'];
}

//총 댓글 개수
async function getCommentCnt(connection, params){
  const query = `
  SELECT COUNT(craftCommentIdx) as totalCommentnt
  FROM CraftComment
  WHERE craftIdx = ? && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCommentnt'];
}

//상품 포토 댓글 전체 가져오기
async function getCommentInfoOnlyPhoto(connection, params){
  const query = `
  SELECT CC.craftCommentIdx as commentIdx,
        U.userIdx,
        U.nickname,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') as createdAt,
        CC.content,
        CC.isReported
  FROM CraftComment CC
          JOIN User U ON U.userIdx = CC.userIdx
  WHERE CC.craftIdx = ? && CC.isDeleted = 'N' && CC.isPhotoComment = 'Y'
  ORDER BY CC.craftCommentIdx
  LIMIT ?, ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품 댓글 전체 가져오기
async function getCommentInfo(connection, params){
  const query = `
  SELECT CC.craftCommentIdx as commentIdx,
        U.userIdx,
        U.nickname,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') as createdAt,
        CC.content,
        CC.isReported
  FROM CraftComment CC
          JOIN User U ON U.userIdx = CC.userIdx
  WHERE CC.craftIdx = ? && CC.isDeleted = 'N'
  ORDER BY CC.craftCommentIdx
  LIMIT ?, ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//댓글 별 사진 가져오기
async function getCommentPhoto(connection, params){
  const query = `
  SELECT imageUrl
  FROM CraftCommentImage
  WHERE craftCommentIdx = ? && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//존재하는 상품 댓글 idx인지
async function isExistCraftCommentIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT craftCommentIdx
    FROM CraftComment
    WHERE isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//사용자가 기존에 신고한 상품 댓글 idx인지
async function isExistUserReportedCommentIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReportedCraftComment
    WHERE userIdx = ? && craftCommentIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//댓글 신고
async function reportComment(connection, params){
  const query = `
  INSERT INTO ReportedCraftComment(userIdx, craftCommentIdx, reportedCraftReasonIdx, etcContent)
  VALUES (?, ?, ?, ?);
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  getOnlyPhotoCommentCnt,
  getCommentCnt,
  getCommentInfoOnlyPhoto,
  getCommentInfo,
  getCommentPhoto,
  isExistCraftCommentIdx,
  isExistUserReportedCommentIdx,
  reportComment,
}