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
  VALUES (${userIdx}, '${title}', '${content}');
  `;
  const [rows] = await connection.query(query);
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

module.exports = {
  isExistQnaIdx,
  getQnADetail,
  createQnA,
  getStoryUserIdx,
  deleteQnA,
  updateQnA,
}