//존재하는 qnaIdx인지
async function isExistQnaIdx(connection, qnaIdx){
  const query = `
  SELECT EXISTS(SELECT qnaIdx
    FROM QnA
    WHERE qnaIdx = ${qnaIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//qna 정보
async function getQnADetail(connection, qnaIdx, userIdx){
  const query = `
  SELECT Q.qnaIdx,
        Q.userIdx,
        U.imageUrl                                                                 as userProfile,
        U.nickname                                                                 as userName,
        Q.title,
        Q.content,
        DATE_FORMAT(Q.createdAt, '%Y.%m.%d.')                                      as createdAt,
        (SELECT COUNT(*) as totalLikeCnt
          FROM QnALike
          WHERE qnaIdx = ${qnaIdx})                                                 as totalLikeCnt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(SELECT *
                      FROM QnALike
                      WHERE qnaIdx = ${qnaIdx} && userIdx = ${userIdx}), 'Y', 'N')) as isLike,
        (SELECT COUNT(*) as totalCommentCnt
          FROM QnAComment QC
          WHERE QC.qnaIdx = ${qnaIdx} && QC.isDeleted = 'N')                        as totalCommentCnt,
        IF(Q.userIdx = ${userIdx}, 'Y', 'N')                                       as isUserQnA
  FROM QnA Q
          JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
  WHERE Q.qnaIdx = ${qnaIdx} && Q.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//qna 작성
async function createQnA(connection, userIdx, title, content){
  const query = `
  INSERT INTO QnA(userIdx, title, content)
  VALUES (${userIdx}, ?, ?);
  `;
  const [rows] = await connection.query(query, [title, content]);
  return rows;
}

//qna의 userIdx 가져오기
async function getStoryUserIdx(connection, qnaIdx){
  const query = `
  SELECT userIdx FROM QnA
  WHERE qnaIdx = ${qnaIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//qna 삭제
async function deleteQnA(connection, qnaIdx){
  const query = `
  UPDATE QnA
  SET isDeleted = 'Y'
  WHERE qnaIdx = ${qnaIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//qna 좋아요 삭제
async function deleteQnALike(connection, qnaIdx){
  const query = `
  DELETE
  FROM QnALike
  WHERE qnaIdx = ${qnaIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//qna 댓글 삭제
async function deleteQnAComment(connection, qnaIdx){
  const query = `
  UPDATE QnAComment
  SET isDeleted = 'Y'
  WHERE qnaIdx = ${qnaIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//qna 수정
async function updateQnA(connection, qnaIdx, title, content){
  const query = `
  UPDATE QnA
  SET title   = IFNULL(?, title),
      content = IFNULL(?, content)
  WHERE qnaIdx = ${qnaIdx};
  `;
  const [rows] = await connection.query(query, [title, content]);
  return rows;
}

//기존에 신고한 qna인지
async function isAlreadyReportedQnA(connection, userIdx, qnaIdx, withTypeIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReqReportedWith
    WHERE withTypeIdx = ${withTypeIdx} && userIdx = ${userIdx} && withIdx = ${qnaIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//자기 qna인지
async function isUserQnA(connection, userIdx, qnaIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM QnA
    WHERE userIdx = ${userIdx} && qnaIdx = ${qnaIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//qna 신고
async function reportQnA(connection, userIdx, qnaIdx, withTypeIdx, reportedReasonIdx, etcReason){
  const query = `
  INSERT INTO ReqReportedWith (withTypeIdx, withIdx, userIdx, reportedReasonIdx, etcReason)
  VALUES (${withTypeIdx}, ${qnaIdx}, ${userIdx}, ${reportedReasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
}

//유저의 qna 전체 삭제
async function deleteUserQnA(connection, userIdx){
  const query = `
  UPDATE QnA
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistQnaIdx,
  getQnADetail,
  createQnA,
  getStoryUserIdx,
  deleteQnA,
  deleteQnALike,
  deleteQnAComment,
  updateQnA,
  isAlreadyReportedQnA,
  isUserQnA,
  reportQnA,
  deleteUserQnA,
}