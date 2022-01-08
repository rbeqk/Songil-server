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

//작가 idx
async function getArtistIdx(connection, userIdx){
  const query = `
  SELECT artistIdx FROM Artist
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  
  return rows[0]?.artistIdx ? rows[0].artistIdx : -1;
}

//작성 WITH(Story, QnA, ABTest) 개수
async function getWrittenWithCnt(connection, userIdx, artistIdx){
  const storyQuery = `
  SELECT COUNT(storyIdx) as totalCnt
  FROM Story
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [storyRows] = await connection.query(storyQuery);

  const QnAQuery = `
  SELECT COUNT(qnaIdx) as totalCnt
  FROM QnA
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [QnARows] = await connection.query(QnAQuery);

  //작가일 경우
  if (artistIdx !== -1){
    //AB Test
    const ABTestQuery = `
    SELECT COUNT(abTestIdx) as totalCnt
    FROM ABTest
    WHERE artistIdx = ${artistIdx} && isDeleted = 'N';
    `;
    const [ABTestRows] = await connection.query(ABTestQuery);

    return storyRows[0]['totalCnt'] + QnARows[0]['totalCnt'] + ABTestRows[0]['totalCnt'];
  }
  //일반 유저일 경우
  else{
    return storyRows[0]['totalCnt'] + QnARows[0]['totalCnt'];
  }
}

//내가 쓴 글
async function getUserWrittenWith(connection, userIdx, artistIdx, startItemIdx, itemPerPage){
  //일반 사용자인 경우 -> Story && QnA
  if (artistIdx === -1){
    const userQuery = `
    SELECT S.storyIdx                                                                   as idx,
          1                                                                            as categoryIdx,
          S.title,
          S.content,
          (SELECT imageUrl
            FROM StoryImage SI
            WHERE SI.storyIdx = S.storyIdx && SI.isDeleted = 'N'
            LIMIT 1) as imageUrl,
          U.nickname                                                                   as name,
          DATE_FORMAT(S.createdAt, '%Y.%m.%d')                                         as createdAt,
          S.createdAt                                                                  as originalCreatedAt,
          (SELECT COUNT(*)
            FROM StoryLike SL
            WHERE SL.storyIdx = S.storyIdx)                                             as totalLikeCnt,
          (SELECT EXISTS(SELECT *
                          FROM StoryLike SL2
                          WHERE SL2.userIdx = ${userIdx} && SL2.storyIdx = S.storyIdx)) as isLike,
          (SELECT COUNT(*)
            FROM StoryComment SC
            WHERE SC.storyIdx = S.storyIdx && SC.isDeleted = 'N')                       as totalCommentCnt
    FROM Story S
            JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
    WHERE S.isDeleted = 'N' && S.userIdx = ${userIdx}
    UNION
    SELECT Q.qnaIdx                                                                 as idx,
          2                                                                        as categoryIdx,
          Q.title,
          Q.content,
          NULL as imageUrl,
          U.nickname                                                               as name,
          DATE_FORMAT(Q.createdAt, '%Y.%m.%d')                                     as createdAt,
          Q.createdAt                                                              as originalCreatedAt,
          (SELECT COUNT(*)
            FROM QnALike QL
            WHERE QL.qnaIdx = Q.qnaIdx)                                             as totalLikeCnt,
          (SELECT EXISTS(SELECT *
                          FROM QnALike QL2
                          WHERE QL2.qnaIdx = Q.qnaIdx && QL2.userIdx = ${userIdx})) as isLike,
          (SELECT COUNT(*)
            FROM QnAComment QC
            WHERE QC.qnaIdx = Q.qnaIdx && QC.isDeleted = 'N')                       as totalCommentCnt
    FROM QnA Q
            JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
    WHERE Q.isDeleted = 'N' && Q.userIdx = ${userIdx}
    ORDER BY originalCreatedAt
    LIMIT ${startItemIdx}, ${itemPerPage};
    `;

    const [userRows] = await connection.query(userQuery);
    return userRows;
  }
  //작가인 경우 -> Story && QnA && ABTest
  else{
    const artistQuery = `
    SELECT S.storyIdx                                                                   as idx,
          1                                                                            as categoryIdx,
          S.title,
          S.content,
          (SELECT imageUrl
            FROM StoryImage SI
            WHERE SI.storyIdx = S.storyIdx && SI.isDeleted = 'N'
            LIMIT 1)                                                                    as imageUrl,
          U.nickname                                                                   as name,
          DATE_FORMAT(S.createdAt, '%Y.%m.%d')                                         as createdAt,
          S.createdAt                                                                  as originalCreatedAt,
          (SELECT COUNT(*)
            FROM StoryLike SL
            WHERE SL.storyIdx = S.storyIdx)                                             as totalLikeCnt,
          (SELECT EXISTS(SELECT *
                          FROM StoryLike SL2
                          WHERE SL2.userIdx = ${userIdx} && SL2.storyIdx = S.storyIdx)) as isLike,
          (SELECT COUNT(*)
            FROM StoryComment SC
            WHERE SC.storyIdx = S.storyIdx && SC.isDeleted = 'N')                       as totalCommentCnt
    FROM Story S
            JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
    WHERE S.isDeleted = 'N' && S.userIdx = ${userIdx}
    UNION
    SELECT Q.qnaIdx                                                                 as idx,
          2                                                                        as categoryIdx,
          Q.title,
          Q.content,
          NULL                                                                     as imageUrl,
          U.nickname                                                               as name,
          DATE_FORMAT(Q.createdAt, '%Y.%m.%d')                                     as createdAt,
          Q.createdAt                                                              as originalCreatedAt,
          (SELECT COUNT(*)
            FROM QnALike QL
            WHERE QL.qnaIdx = Q.qnaIdx)                                             as totalLikeCnt,
          (SELECT EXISTS(SELECT *
                          FROM QnALike QL2
                          WHERE QL2.qnaIdx = Q.qnaIdx && QL2.userIdx = ${userIdx})) as isLike,
          (SELECT COUNT(*)
            FROM QnAComment QC
            WHERE QC.qnaIdx = Q.qnaIdx && QC.isDeleted = 'N')                       as totalCommentCnt
    FROM QnA Q
            JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
    WHERE Q.isDeleted = 'N' && Q.userIdx = ${userIdx}
    UNION
    SELECT AB.abTestIdx                                                as idx,
          3                                                           as categoryIdx,
          NULL                                                        as title,
          AB.content,
          NULL                                                        as imageUrl,
          U.nickname                                                  as name,
          DATE_FORMAT(AB.createdAt, '%Y.%m.%d')                       as createdAt,
          AB.createdAt                                                as originalCreatedAt,
          NULL                                                        as totalLikeCnt,
          NULL                                                        as isLike,
          (SELECT COUNT(*)
            FROM ABTestComment ABC
            WHERE ABC.isDeleted = 'N' && ABC.abTestIdx = AB.abTestIdx) as totalCommentCnt
    FROM ABTest AB
            JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
            JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
    WHERE AB.isDeleted = 'N' && AB.artistIdx = ${artistIdx}
    ORDER BY originalCreatedAt
    LIMIT ${startItemIdx}, ${itemPerPage};
    `;

    const [artistRows] = await connection.query(artistQuery);
    return artistRows;
  }
}

//댓글 단 글 페이지 개수(Story, QnA, ABTest)
async function getUserWrittenWithCommentTotalCnt(connection, userIdx){
  const storyQuery = `
  SELECT COUNT(storyCommentIdx) as totalCnt FROM StoryComment
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [storyRows] = await connection.query(storyQuery);
  
  const QnAQuery = `
  SELECT COUNT(qnaCommentIdx) as totalCnt FROM QnAComment
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [QnARows] = await connection.query(QnAQuery);

  const ABTestQuery = `
  SELECT COUNT(abTestCommentIdx) as totalCnt FROM ABTestComment
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [ABTestRows] = await connection.query(ABTestQuery);

  return storyRows[0]['totalCnt'] + QnARows[0]['totalCnt'] + ABTestRows[0]['totalCnt'];
}

module.exports = {
  getTotalWrittenCommentCnt,
  getWrittenComment,
  getArtistIdx,
  getWrittenWithCnt,
  getUserWrittenWith,
  getUserWrittenWithCommentTotalCnt,
}