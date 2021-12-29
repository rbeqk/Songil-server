//Hot Talk 15개 가져오기
async function getHotTalk(connection){
  const query = `
  SELECT QL.qnaIdx                                             as idx,
        COUNT(QL.userIdx)                                     as totalLikeCnt,
        1                                                     as categoryIdx,
        Q.title                                               as text,
        NULL                                                  as imageUrl,
        (SELECT COUNT(userIdx)
          FROM QnAComment QAC
          WHERE QAC.qnaIdx = QL.qnaIdx && QAC.isDeleted = 'N') as totalCommentCnt
  FROM QnALike QL
          JOIN QnA Q ON Q.qnaIdx = QL.qnaIdx && Q.isDeleted = 'N'
  GROUP BY QL.qnaIdx
  UNION ALL
  SELECT ABV.abTestIdx      as idx,
        COUNT(ABV.userIdx) as totalLikeCnt,
        2                  as categoryIdx,
        U.nickname         as text,
        U.imageUrl,
        NULL               as totalCommentCnt
  FROM ABTestVote ABV
          JOIN ABTest AB ON AB.abTestIdx = ABV.abTestIdx && AB.isDeleted = 'N'
          JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  GROUP BY ABV.abTestIdx
  ORDER BY totalLikeCnt DESC
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 총 개수 가져오기
async function getStoryTotalCnt(connection){
  const query = `
  SELECT COUNT(storyIdx) as totalCnt FROM Story
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//qna 총 개수 가져오기
async function getQnaTotalCnt(connection){
  const query = `
  SELECT COUNT(qnaIdx) as totalCnt FROM QnA
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//ABTest 총 개수 가져오기
async function getABTestTotalCnt(connection){
  const query = `
  SELECT COUNT(abTestIdx) as totalCnt FROM ABTest
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//스토리 목록 가져오기
async function getStory(connection, userIdx, sort, startItemIdx, pageItemCnt){
  const query = `
  SELECT S.storyIdx,
        (SELECT SI.imageUrl
          FROM StoryImage SI
          WHERE SI.isDeleted = 'N' && SI.storyIdx = S.storyIdx
          LIMIT 1)                                                                   as mainImageUrl,
        S.title,
        S.userIdx,
        U.nickname as userName,
        (SELECT COUNT(*)
          FROM StoryLike SL
          WHERE SL.storyIdx = S.storyIdx)                                            as totalLikeCnt,
        IF((SELECT EXISTS(
                        SELECT *
                        FROM StoryLike SL
                        WHERE SL.storyIdx = S.storyIdx && SL.userIdx = ${userIdx})), 'Y', 'N') as isLike
  FROM Story S
          JOIN User U on S.userIdx = U.useridx && U.isDeleted = 'N'
  WHERE S.isDeleted = 'N'
  ORDER BY (CASE WHEN '${sort}' = 'new' THEN S.createdAt END) ASC,
          (CASE WHEN '${sort}' = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//QnA 목록 가져오기
async function getQnA(connection, userIdx, sort, startItemIdx, pageItemCnt){
  const query = `
  SELECT Q.qnaIdx,
        Q.title,
        Q.content,
        DATE_FORMAT(Q.createdAt, '%Y.%m.%d.')                                                  as createdAt,
        Q.userIdx,
        U.nickname                                                                            as userName,
        (SELECT COUNT(QL.userIdx) FROM QnALike QL WHERE QL.qnaIdx = Q.qnaIdx)                 as totalLikeCnt,
        IF((SELECT EXISTS(
                            SELECT *
                            FROM QnALike QL
                            WHERE QL.qnaIdx = Q.qnaIdx && QL.userIdx = ${userIdx})), 'Y', 'N') as isLike
  FROM QnA Q
          JOIN User U on U.userIdx = Q.userIdx && U.isDeleted = 'N'
  WHERE Q.isDeleted = 'N'
  ORDER BY (CASE WHEN '${sort}' = 'new' THEN Q.createdAt END) ASC,
          (CASE WHEN '${sort}' = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getHotTalk,
  getStoryTotalCnt,
  getQnaTotalCnt,
  getABTestTotalCnt,
  getStory,
  getQnA,
}