//존재하는 parentIdx인지
async function isExistQnACommentParentIdx(connection, qnaIdx, parentIdx){
  const query = `
  SELECT EXISTS(SELECT qnaCommentIdx
    FROM QnAComment
    WHERE qnaCommentIdx = ${parentIdx} && qnaIdx = ${qnaIdx} && isDeleted = 'N' && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//qna 댓글 작성
async function createQnAComment(connection, qnaIdx, userIdx, parentIdx, comment){
  const query = `
  INSERT INTO QnAComment(qnaIdx, userIdx, parentIdx, comment)
  VALUES (${qnaIdx}, ${userIdx}, ${parentIdx}, ?);
  `;
  const [rows] = await connection.query(query, [comment]);
  return rows;
}

//존재하는 QnA 댓글 idx인지
async function isExistQnACommentIdx(connection, qnaCommentIdx){
  const query = `
  SELECT EXISTS(SELECT qnaCommentIdx
    FROM QnAComment
    WHERE qnaCommentIdx = ${qnaCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//QnA 댓글의 userIdx 가져오기
async function getQnACommentUserIdx(connection, qnaCommentIdx){
  const query = `
  SELECT userIdx FROM QnAComment
  WHERE qnaCommentIdx = ${qnaCommentIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//QnA 댓글 삭제
async function deleteStoryComment(connection, qnaCommentIdx){
  const query = `
  UPDATE QnAComment
  SET isDeleted = 'Y'
  WHERE qnaCommentIdx = ${qnaCommentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//QnA 부모 댓글 가져오기
async function getQnAParentComment(connection, qnaIdx, userIdx, pageItemCnt, startItemIdx){
  const query = `
  SELECT QC.qnaCommentIdx                      as commentIdx,
          QC.userIdx,
          U.imageUrl                            as userProfile,
          U.nickname                            as userName,
          IF(Q.userIdx = QC.userIdx, 'Y', 'N')  as isWriter,
          QC.comment,
          CASE
            WHEN TIMESTAMPDIFF(minute, QC.createdAt, NOW()) < 1
                THEN '방금 전'
            WHEN TIMESTAMPDIFF(hour, QC.createdAt, NOW()) < 1
                THEN CONCAT(TIMESTAMPDIFF(minute, QC.createdAt, NOW()), '분 전')
            WHEN TIMESTAMPDIFF(hour, QC.createdAt, NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(hour, QC.createdAt, NOW()), '시간 전')
            WHEN TIMESTAMPDIFF(day, DATE_FORMAT(QC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')) <= 3
                THEN CONCAT(TIMESTAMPDIFF(day, DATE_FORMAT(QC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')), '일 전')
            ELSE DATE_FORMAT(QC.createdAt, '%Y.%m.%d. %H:%i')
            END                                                     as createdAt,
          IF(QC.userIdx = ${userIdx}, 'Y', 'N') as isUserComment,
          QC.isDeleted,
          QC.isReported
    FROM QnAComment QC
            JOIN User U ON U.userIdx = QC.userIdx && U.isDeleted = 'N'
            JOIN QnA Q ON Q.qnaIdx = QC.qnaIdx && Q.isDeleted = 'N'
    WHERE QC.parentIdx IS NULL && QC.qnaIdx = ${qnaIdx}
    LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//QnA 대댓글 가져오기
async function getQnARecomment(connection, parentIdx, userIdx){
  const query = `
  SELECT QC.qnaCommentIdx                      as commentIdx,
          QC.userIdx,
          U.imageUrl                            as userProfile,
          U.nickname                            as userName,
          IF(QC.userIdx = Q.userIdx, 'Y', 'N')  as isWriter,
          QC.comment,
          CASE
            WHEN TIMESTAMPDIFF(minute, QC.createdAt, NOW()) < 1
                THEN '방금 전'
            WHEN TIMESTAMPDIFF(hour, QC.createdAt, NOW()) < 1
                THEN CONCAT(TIMESTAMPDIFF(minute, QC.createdAt, NOW()), '분 전')
            WHEN TIMESTAMPDIFF(hour, QC.createdAt, NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(hour, QC.createdAt, NOW()), '시간 전')
            WHEN TIMESTAMPDIFF(day, DATE_FORMAT(QC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')) <= 3
                THEN CONCAT(TIMESTAMPDIFF(day, DATE_FORMAT(QC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')), '일 전')
            ELSE DATE_FORMAT(QC.createdAt, '%Y.%m.%d. %H:%i')
            END                                                     as createdAt,
          IF(QC.userIdx = ${userIdx}, 'Y', 'N') as isUserComment,
          QC.isReported
    FROM QnAComment QC
            JOIN User U ON U.userIdx = QC.userIdx && U.isDeleted = 'N'
            JOIN QnA Q ON Q.qnaIdx = QC.qnaIdx && Q.isDeleted = 'N'
    WHERE QC.parentIdx IS NOT NULL && QC.isDeleted = 'N' && QC.parentIdx = ${parentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//QnA 댓글 신고
async function reportQnAComment(connection, qnaCommentIdx, userIdx, reportedReasonIdx, etcReason, commentTypeIdx){
  const query = `
  INSERT INTO ReqReportedComment(commentTypeIdx, commentIdx, userIdx, reportedReasonIdx, etcReason)
  VALUES (${commentTypeIdx}, ${qnaCommentIdx}, ${userIdx}, ${reportedReasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
}

//사용자가 기존에 신고한 QnA 댓글 idx인지
async function isAlreadyReportedQnACommentIdx(connection, userIdx, qnaCommentIdx, commentTypeIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReqReportedComment
    WHERE userIdx = ${userIdx} && commentIdx = ${qnaCommentIdx} && commentTypeIdx = ${commentTypeIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//자기 QnA 댓글인지
async function isUserQnAComment(connection, userIdx, qnaCommentIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM QnAComment
    WHERE userIdx = ${userIdx} && qnaCommentIdx = ${qnaCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

module.exports = {
  isExistQnACommentParentIdx,
  createQnAComment,
  isExistQnACommentIdx,
  getQnACommentUserIdx,
  deleteStoryComment,
  getQnAParentComment,
  getQnARecomment,
  reportQnAComment,
  isAlreadyReportedQnACommentIdx,
  isUserQnAComment,
}