//작성한 코멘트 수
async function getTotalWrittenCommentCnt(connection, userIdx){
  const query = `
  SELECT COUNT(craftCommentIdx) as totalCnt FROM CraftComment
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//작성한 코멘트
async function getWrittenComment(connection, userIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT CC.craftCommentIdx                    as commentIdx,
        CC.craftIdx,
        A.artistIdx,
        U.nickname                            as artistName,
        CC.content,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') as createdAt
  FROM CraftComment CC
          JOIN Craft C ON C.craftIdx = CC.craftIdx
          JOIN Artist A ON C.artistIdx = A.artistIdx
          JOIN User U ON U.userIdx = A.userIdx
  WHERE CC.isDeleted = 'N' && CC.userIdx = ${userIdx}
  ORDER BY CC.craftCommentIdx
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//좋아요한 Story 개수
async function getLikedStoryCnt(connection, userIdx){
  const query = `
  SELECT COUNT(*) as totalCnt FROM StoryLike
  WHERE userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//좋아요한 QnA 개수
async function getLikedQnACnt(connection, userIdx){
  const query = `
  SELECT COUNT(*) as totalCnt FROM QnALike
  WHERE userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//좋아요한 게시물
async function getLikedPost(connection, userIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT NULL                                                    as qnaIdx,
        SL.storyIdx,
        S.title,
        S.content,
        (SELECT imageUrl
          FROM StoryImage SI
          WHERE SI.isDeleted = 'N' && SI.storyIdx = SL.storyIdx
          LIMIT 1)                                               as imageUrl,
        S.userIdx,
        U.nickname                                              as userName,
        DATE_FORMAT(S.createdAt, '%Y.%m.%d')                    as createdAt,
        SL.createdAt                                            as originalCreatedAt,
        (SELECT COUNT(*)
          FROM StoryLike
          WHERE StoryLike.storyIdx = SL.storyIdx)                as totalLikeCnt,
        (SELECT COUNT(storyCommentIdx)
          FROM StoryComment SC
          WHERE SC.storyIdx = SL.storyIdx && SC.isDeleted = 'N') as totalCommentCnt
  FROM StoryLike SL
          JOIN Story S ON S.storyIdx = SL.storyIdx && S.isDeleted = 'N'
          JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
  WHERE SL.userIdx = ${userIdx}
  UNION ALL
  SELECT QL.qnaIdx,
        NULL                                                            as storyIdx,
        Q.title,
        Q.content,
        NULL as imageUrl,
        Q.userIdx,
        U.nickname                                                      as userName,
        DATE_FORMAT(Q.createdAt, '%Y.%m.%d')                            as createdAt,
        QL.createdAt                                                    as originalCreatedAt,
        (SELECT COUNT(*) FROM QnALike WHERE QnALike.qnaIdx = QL.qnaIdx) as totalLikeCnt,
        (SELECT COUNT(qnaCommentIdx)
          FROM QnAComment QC
          WHERE QC.qnaIdx = QL.qnaIdx && QC.isDeleted = 'N')             as totalCommentCnt
  FROM QnALike QL
          JOIN QnA Q ON Q.qnaIdx = QL.qnaIdx && Q.isDeleted = 'N'
          JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
  WHERE QL.userIdx = ${userIdx}
  ORDER BY originalCreatedAt
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getTotalWrittenCommentCnt,
  getWrittenComment,
  getLikedStoryCnt,
  getLikedQnACnt,
  getLikedPost,
}