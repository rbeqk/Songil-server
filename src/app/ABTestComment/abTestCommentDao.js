//존재하는 parentIdx인지
async function isExistABTestCommentParentIdx(connection, parentIdx){
  const query = `
  SELECT EXISTS(SELECT abTestCommentIdx
    FROM ABTestComment
    WHERE abTestCommentIdx = ${parentIdx} && isDeleted = 'N' && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//abTest 댓글 작성
async function createABTestComment(connection, abTestIdx, userIdx, parentIdx, comment){
  const query = `
  INSERT INTO ABTestComment(abTestIdx, userIdx, parentIdx, comment)
  VALUES (${abTestIdx}, ${userIdx}, ${parentIdx}, '${comment}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//존재하는 abTest 댓글 idx인지
async function isExistABTestCommentIdx(connection, abTestCommentIdx){
  const query = `
  SELECT EXISTS(SELECT abTestCommentIdx
    FROM ABTestComment
    WHERE abTestCommentIdx = ${abTestCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//abTest 댓글의 userIdx 가져오기
async function getABTestommentUserIdx(connection, abTestCommentIdx){
  const query = `
  SELECT userIdx FROM ABTestComment
  WHERE abTestCommentIdx = ${abTestCommentIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//abTest 댓글 삭제
async function deleteABTestomment(connection, abTestCommentIdx){
  const query = `
  UPDATE ABTestComment
  SET isDeleted = 'Y'
  WHERE abTestCommentIdx = ${abTestCommentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//abTest 부모 댓글 가져오기
async function getABTestParentComment(connection, abTestIdx, userIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT AC.abTestCommentIdx                                          as commentIdx,
        AC.userIdx,
        U.imageUrl                                                   as userProfile,
        U.nickname                                                   as userName,
        IF(AC.userIdx = (SELECT A.userIdx
                          FROM ABTest AB
                                  JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                          WHERE abTestIdx = ${abTestIdx}), 'Y', 'N') as isWriter,
        AC.comment,
        DATE_FORMAT(AC.createdAt, '%Y.%m.%d')                        as createdAt,
        IF(AC.userIdx = ${userIdx}, 'Y', 'N')                        as isUserComment,
        AC.isDeleted
  FROM ABTestComment AC
          JOIN User U ON U.userIdx = AC.userIdx && U.isDeleted = 'N'
          JOIN ABTest A on AC.abTestIdx = A.abTestIdx && A.isDeleted = 'N'
  WHERE AC.parentIdx IS NULL && AC.abTestIdx = ${abTestIdx}
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//abTest 대댓글 가져오기
async function getABTestReComment(connection, abTestIdx, parentIdx, userIdx){
  const query = `
  SELECT AC.abTestCommentIdx                                          as commentIdx,
        AC.userIdx,
        U.imageUrl                                                   as userProfile,
        U.nickname                                                   as userName,
        IF(AC.userIdx = (SELECT A.userIdx
                          FROM ABTest AB
                                  JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                          WHERE abTestIdx = ${abTestIdx}), 'Y', 'N') as isWriter,
        AC.comment,
        DATE_FORMAT(AC.createdAt, '%Y.%m.%d')                        as createdAt,
        IF(AC.userIdx = ${userIdx}, 'Y', 'N')                        as isUserComment
  FROM ABTestComment AC
          JOIN User U ON U.userIdx = AC.userIdx && U.isDeleted = 'N'
  WHERE AC.parentIdx IS NOT NULL && AC.isDeleted = 'N' && AC.parentIdx = ${parentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistABTestCommentParentIdx,
  createABTestComment,
  isExistABTestCommentIdx,
  getABTestommentUserIdx,
  deleteABTestomment,
  getABTestParentComment,
  getABTestReComment,
}