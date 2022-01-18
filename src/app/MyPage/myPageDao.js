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
  ORDER BY CC.craftCommentIdx DESC
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
            LIMIT 1) as mainImageUrl,
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
          NULL as mainImageUrl,
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
    ORDER BY originalCreatedAt DESC
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
            LIMIT 1)                                                                    as mainImageUrl,
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
          NULL                                                                     as mainImageUrl,
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
          NULL                                                        as mainImageUrl,
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
    ORDER BY originalCreatedAt DESC
    LIMIT ${startItemIdx}, ${itemPerPage};
    `;

    const [artistRows] = await connection.query(artistQuery);
    return artistRows;
  }
}

//댓글 단 글 조회
async function getUserWrittenWithComment(connection, userIdx, startItemIdx, itemPerPage){
  const query = `
  SELECT SC.storyIdx                                                                           as idx,
        1                                                                                     as categoryIdx,
        (SELECT imageUrl
          FROM StoryImage SI
          WHERE SI.storyIdx = S.storyIdx && SI.isDeleted = 'N'
          LIMIT 1)                                                                             as mainImageUrl,
        S.title,
        S.content,
        U.nickname                                                                            as name,
        DATE_FORMAT(S.createdAt, '%Y.%m.%d')                                                  as createdAt,
        SC.originalCreatedAt,
        (SELECT COUNT(*)
          FROM StoryLike SL
          WHERE SL.storyIdx = S.storyIdx)                                                      as totalLikeCnt,
        IF(EXISTS(SELECT *
                  FROM StoryLike SL2
                  WHERE SL2.userIdx = ${userIdx} && SL2.storyIdx = S.storyIdx), 'Y', 'N')     as isLike,
        (SELECT COUNT(*)
          FROM StoryComment SC2
          WHERE SC2.userIdx = ${userIdx} && SC2.storyIdx = SC.storyIdx && SC2.isDeleted = 'N') as totalCommentCnt
  FROM (
          SELECT storyCommentIdx, storyIdx, createdAt as originalCreatedAt
          FROM StoryComment
          WHERE userIdx = ${userIdx} && isDeleted = 'N'
          ORDER BY originalCreatedAt DESC
          LIMIT 18446744073709551615
      ) SC
          JOIN Story S ON S.storyIdx = SC.storyIdx && S.isDeleted = 'N'
          JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
  GROUP BY SC.storyIdx
  UNION
  SELECT QC.qnaIdx                                                                      as idx,
        2                                                                              as categoryIdx,
        NULL                                                                           as imageUrl,
        Q.title,
        Q.content,
        U.nickname                                                                     as name,
        DATE_FORMAT(Q.createdAt, '%Y.%m.%d')                                           as createdAt,
        QC.originalCreatedAt,
        (SELECT COUNT(*)
          FROM QnALike QL
          WHERE QL.qnaIdx = QC.qnaIdx)                                                  as totalLikeCnt,
        IF(EXISTS(SELECT *
                  FROM QnALike QL2
                  WHERE QL2.userIdx = ${userIdx} && QL2.qnaIdx = QC.qnaIdx), 'Y', 'N') as isLike,
        (SELECT COUNT(*)
          FROM QnAComment QC2
          WHERE QC2.qnaIdx = QC.qnaIdx && QC2.isDeleted = 'N')                          as totalCommentCnt
  FROM (
          SELECT qnaIdx, createdAt as originalCreatedAt
          FROM QnAComment
          WHERE isDeleted = 'N' && userIdx = ${userIdx}
          ORDER BY originalCreatedAt DESC
          LIMIT 18446744073709551615
      ) QC
          JOIN QnA Q ON Q.qnaIdx = QC.qnaIdx && Q.isDeleted = 'N'
          JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
  GROUP BY QC.qnaIdx
  UNION
  SELECT ABC.abTestIdx                                                  as idx,
        3                                                              as categoryIdx,
        NULL                                                           as imageUrl,
        NULL                                                           as title,
        AB.content,
        U.nickname                                                     as name,
        DATE_FORMAT(AB.createdAt, '%Y.%m.%d')                          as createdAt,
        ABC.originalCreatedAt,
        NULL                                                           as totalLikeCnt,
        NULL                                                           as isLike,
        (SELECT COUNT(*)
          FROM ABTestComment ABC2
          WHERE ABC2.abTestIdx = ABC.abTestIdx && ABC2.isDeleted = 'N') as totalCommentCnt
  FROM (
          SELECT abTestCommentIdx, abTestIdx, createdAt as originalCreatedAt
          FROM ABTestComment
          WHERE userIdx = ${userIdx} && isDeleted = 'N'
          ORDER BY originalCreatedAt DESC
          LIMIT 18446744073709551615
      ) ABC
          JOIN ABTest AB ON AB.abTestIdx = ABC.abTestIdx && AB.isDeleted = 'N'
          JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  GROUP BY ABC.abTestIdx
  ORDER BY originalCreatedAt DESC
  LIMIT ${startItemIdx}, ${itemPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getWrittenComment,
  getArtistIdx,
  getUserWrittenWith,
  getUserWrittenWithComment,
}