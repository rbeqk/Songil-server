//존재하는 parentIdx인지
async function isExistABTestCommentParentIdx(connection, abTestIdx, parentIdx){
  const query = `
  SELECT EXISTS(SELECT abTestCommentIdx
    FROM ABTestComment
    WHERE abTestIdx = ${abTestIdx} && abTestCommentIdx = ${parentIdx} && isDeleted = 'N' && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//abTest 댓글 작성
async function createABTestComment(connection, abTestIdx, userIdx, parentIdx, comment){
  const query = `
  INSERT INTO ABTestComment(abTestIdx, userIdx, parentIdx, comment)
  VALUES (${abTestIdx}, ${userIdx}, ${parentIdx}, ?);
  `;
  const [rows] = await connection.query(query, [comment]);
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
  SELECT AC.abTestCommentIdx                                         as commentIdx,
        AC.userIdx,
        U.imageUrl                                                  as userProfile,
        U.nickname                                                  as userName,
        IF(AC.userIdx = (SELECT A.userIdx
                          FROM ABTest AB
                                  JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                          WHERE abTestIdx = ${abTestIdx}), 'Y', 'N') as isWriter,
        AC.comment,
        CASE
            WHEN TIMESTAMPDIFF(minute, AC.createdAt, NOW()) < 1
                THEN '방금 전'
            WHEN TIMESTAMPDIFF(hour, AC.createdAt, NOW()) < 1
                THEN CONCAT(TIMESTAMPDIFF(minute, AC.createdAt, NOW()), '분 전')
            WHEN TIMESTAMPDIFF(hour, AC.createdAt, NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(hour, AC.createdAt, NOW()), '시간 전')
            WHEN TIMESTAMPDIFF(day, DATE_FORMAT(AC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(), '%Y-%m-%d')) <= 3
                THEN CONCAT(TIMESTAMPDIFF(day, DATE_FORMAT(AC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(), '%Y-%m-%d')),
                            '일 전')
            ELSE DATE_FORMAT(AC.createdAt, '%Y.%m.%d. %H:%i')
            END                                                     as createdAt,
        IF(AC.userIdx = ${userIdx}, 'Y', 'N')                       as isUserComment,
        AC.isDeleted,
        AC.isReported
  FROM ABTestComment AC
          JOIN User U ON U.userIdx = AC.userIdx && U.isDeleted = 'N'
          JOIN ABTest A on AC.abTestIdx = A.abTestIdx && A.isDeleted = 'N'
          LEFT JOIN (SELECT parentIdx, COUNT(abTestCommentIdx) AS childCommentCnt
                      FROM ABTestComment
                      WHERE isDeleted = 'N' && parentIdx IS NOT NULL
                      GROUP BY parentIdx) ACC
                    ON ACC.parentIdx = AC.abTestCommentIdx
  WHERE AC.parentIdx IS NULL && AC.abTestIdx = ${abTestIdx} &&
        (AC.isDeleted = 'N' || (AC.isDeleted = 'Y' && childCommentCnt IS NOT NULL))
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//abTest 대댓글 가져오기
async function getABTestReComment(connection, abTestIdx, parentIdx, userIdx){
  const query = `
  SELECT AC.abTestCommentIdx                                         as commentIdx,
        AC.userIdx,
        U.imageUrl                                                  as userProfile,
        U.nickname                                                  as userName,
        IF(AC.userIdx = (SELECT A.userIdx
                          FROM ABTest AB
                                  JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                          WHERE abTestIdx = ${abTestIdx}), 'Y', 'N') as isWriter,
        AC.comment,
        CASE
            WHEN TIMESTAMPDIFF(minute, AC.createdAt, NOW()) < 1
                THEN '방금 전'
            WHEN TIMESTAMPDIFF(hour, AC.createdAt, NOW()) < 1
                THEN CONCAT(TIMESTAMPDIFF(minute, AC.createdAt, NOW()), '분 전')
            WHEN TIMESTAMPDIFF(hour, AC.createdAt, NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(hour, AC.createdAt, NOW()), '시간 전')
            WHEN TIMESTAMPDIFF(day, DATE_FORMAT(AC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')) <= 3
                THEN CONCAT(TIMESTAMPDIFF(day, DATE_FORMAT(AC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')), '일 전')
            ELSE DATE_FORMAT(AC.createdAt, '%Y.%m.%d. %H:%i')
            END                                                     as createdAt,
        IF(AC.userIdx = ${userIdx}, 'Y', 'N')                       as isUserComment,
        AC.isReported
  FROM ABTestComment AC
          JOIN User U ON U.userIdx = AC.userIdx && U.isDeleted = 'N'
  WHERE AC.parentIdx IS NOT NULL && AC.isDeleted = 'N' && AC.parentIdx = ${parentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//사용자가 기존에 신고한 ABTest 댓글 idx인지
async function isAlreadyReportedABTestCommentIdx(connection, userIdx, abTestCommentIdx, commentTypeIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReqReportedComment
    WHERE userIdx = ${userIdx} && commentIdx = ${abTestCommentIdx} && commentTypeIdx = ${commentTypeIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//자기 댓글인지
async function isUserABTestComment(connection, userIdx, abTestCommentIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ABTestComment
    WHERE userIdx = ${userIdx} && abTestCommentIdx = ${abTestCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//ABTest 댓글 신고
async function reportABTestComment(connection, abTestCommentIdx, userIdx, reportedReasonIdx, etcReason, commentTypeIdx){
  const query = `
  INSERT INTO ReqReportedComment(commentTypeIdx, commentIdx, userIdx, reportedReasonIdx, etcReason)
  VALUES (${commentTypeIdx}, ${abTestCommentIdx}, ${userIdx}, ${reportedReasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
}

//유저의 abTest 댓글 전체 삭제
async function deleteUserABTestComment(connection, userIdx){
  const query = `
  UPDATE ABTestComment
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
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
  isAlreadyReportedABTestCommentIdx,
  isUserABTestComment,
  reportABTestComment,
  deleteUserABTestComment,
}