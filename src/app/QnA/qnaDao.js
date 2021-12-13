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
      U.imageUrl                                                 as userProfile,
      U.nickname                                                 as userName,
      Q.title,
      Q.content,
      DATE_FORMAT(Q.createdAt, '%Y.%m.%d.')                      as createdAt,
      (SELECT COUNT(*) as totalLikeCnt
      FROM QnALike
      WHERE qnaIdx = ${qnaIdx})                                         as totalLikeCnt,
      (SELECT EXISTS(SELECT *
                    FROM QnALike
                    WHERE qnaIdx = ${qnaIdx} && userIdx = ${userIdx}) as isLike) as isLike,
      (SELECT COUNT(*) as totalCommentCnt
      FROM QnAComment QC
      WHERE QC.qnaIdx = ${qnaIdx} && QC.isDeleted = 'N')                as totalCommentCnt
  FROM QnA Q
          JOIN User U ON U.userIdx = Q.qnaIdx && U.isDeleted = 'N'
  WHERE Q.qnaIdx = ${qnaIdx} && Q.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//qna 작성
async function createQnA(connection, userIdx, title, content){
  const query = `
  INSERT INTO QnA(userIdx, title, content)
  VALUES (${userIdx}, '${title}', '${content}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistQnaIdx,
  getQnADetail,
  createQnA,
}