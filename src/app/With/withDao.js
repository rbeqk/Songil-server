//스토리 총 개수 가져오기
async function getStoryTotalCnt(connection, blockUsers){
  const query = `
  SELECT COUNT(storyIdx) AS totalCnt
  FROM Story
  WHERE isDeleted = 'N' && userIdx NOT IN (?);
  `;
  const [rows] = await connection.query(query, [blockUsers]);
  return rows[0]['totalCnt'];
}

//qna 총 개수 가져오기
async function getQnaTotalCnt(connection, blockUsers){
  const query = `
  SELECT COUNT(qnaIdx) as totalCnt FROM QnA
  WHERE isDeleted = 'N' && userIdx NOT IN (?);
  `;
  const [rows] = await connection.query(query, [blockUsers]);
  return rows[0]['totalCnt'];
}

//ABTest 총 개수 가져오기
async function getABTestTotalCnt(connection, blockUsers){
  const query = `
  SELECT COUNT(AB.abTestIdx) AS totalCnt
  FROM ABTest AB
          JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
  WHERE AB.isDeleted = 'N' && A.userIdx NOT IN (?);
  `;
  const [rows] = await connection.query(query, [blockUsers]);
  return rows[0]['totalCnt'];
}

//스토리 목록 가져오기
async function getStory(connection, userIdx, blockUsers, sort, startItemIdx, pageItemCnt){
  const query = `
  SELECT S.storyIdx,
        (SELECT SI.imageUrl
          FROM StoryImage SI
          WHERE SI.storyIdx = S.storyIdx
          LIMIT 1)                                                                            as mainImageUrl,
        S.title,
        S.userIdx,
        U.nickname                                                                           as userName,
        (SELECT COUNT(*)
          FROM StoryLike SL
          WHERE SL.storyIdx = S.storyIdx)                                                     as totalLikeCnt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(
                      SELECT *
                      FROM StoryLike SL
                      WHERE SL.storyIdx = S.storyIdx && SL.userIdx = ${userIdx}), 'Y', 'N')) as isLike
  FROM Story S
          JOIN User U on S.userIdx = U.useridx && U.isDeleted = 'N'
  WHERE S.isDeleted = 'N' && S.userIdx NOT IN (?)
  ORDER BY (CASE WHEN ? = 'new' THEN S.createdAt END) ASC,
          (CASE WHEN ? = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query, [blockUsers, sort, sort]);
  return rows;
}

//QnA 목록 가져오기
async function getQnA(connection, userIdx, blockUsers, sort, startItemIdx, pageItemCnt){
  const query = `
  SELECT Q.qnaIdx,
        Q.title,
        Q.content,
        DATE_FORMAT(Q.createdAt, '%Y.%m.%d.')                                            as createdAt,
        Q.userIdx,
        U.nickname                                                                       as userName,
        U.imageUrl                                                                       as userProfile,
        IF(Q.userIdx = ${userIdx}, 'Y', 'N')                                             as isUserQnA,
        (SELECT COUNT(QL.userIdx) FROM QnALike QL WHERE QL.qnaIdx = Q.qnaIdx)            as totalLikeCnt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(
                      SELECT *
                      FROM QnALike QL
                      WHERE QL.qnaIdx = Q.qnaIdx && QL.userIdx = ${userIdx}), 'Y', 'N')) as isLike,
        (SELECT COUNT(*)
          FROM QnAComment QAC
          WHERE QAC.qnaIdx = Q.qnaIdx && QAC.isDeleted = 'N')                             as totalCommentCnt
  FROM QnA Q
          JOIN User U on U.userIdx = Q.userIdx && U.isDeleted = 'N'
  WHERE Q.isDeleted = 'N' && Q.userIdx NOT IN (?)
  ORDER BY (CASE WHEN ? = 'new' THEN Q.createdAt END) ASC,
          (CASE WHEN ? = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query, [blockUsers, sort, sort]);
  return rows;
}

async function getABTest(connection, blockUsers, startItemIdx, pageItemCnt){
  const query = `
  SELECT AB.abTestIdx,
        AB.artistIdx,
        U.imageUrl                                                  as artistImageUrl,
        U.nickname                                                  as artistName,
        AB.content,
        AB.imageA,
        AB.imageB,
        DATE_FORMAT(AB.deadline, '%Y.%m.%d')                        as deadline,
        (SELECT COUNT(*) as totalCommentCnt
          FROM ABTestComment ABC
          WHERE ABC.abTestIdx = AB.abTestIdx && ABC.isDeleted = 'N') as totalCommentCnt,
        IF(TIMESTAMPDIFF(SECOND, NOW(), deadline) < 0, 'Y', 'N')    as isFinished,
        IF(U.userIdx = ${userIdx}, 'Y', 'N') as isUserABTest
  FROM ABTest AB
          JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE AB.isDeleted = 'N' && U.userIdx NOT IN (?)
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query, [blockUsers]);
  return rows;
}

async function isBlocked(connection, userIdx, blockUserIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM UserBlock
    WHERE userIdx = ${userIdx} && blockUserIdx = ${blockUserIdx}) AS isExists;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExists'];
}

async function blockUser(connection, userIdx, blockUserIdx){
  const query = `
  INSERT INTO UserBlock(userIdx, blockUserIdx)
  VALUES (${userIdx}, ${blockUserIdx});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

async function getBlockUsers(connection, userIdx){
  const query = `
  SELECT blockUserIdx
  FROM UserBlock
  WHERE userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows.length > 0 ? rows.map(item => item.blockUserIdx) : [-1];
}

module.exports = {
  getStoryTotalCnt,
  getQnaTotalCnt,
  getABTestTotalCnt,
  getStory,
  getQnA,
  getABTest,
  isBlocked,
  blockUser,
  getBlockUsers,
}