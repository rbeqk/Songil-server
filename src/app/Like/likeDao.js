//현재 사용자의 상품 좋아요 상태 가져오기
async function craftIsLike(connection, userIdx, craftIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM CraftLike
    WHERE userIdx = ${userIdx} && craftIdx = ${craftIdx}) as isLike;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isLike'];
}

//사용자의 상품 좋아요 삭제
async function changeCraftToDisLike(connection, userIdx, craftIdx){
  const query = `
  DELETE
  FROM CraftLike
  WHERE userIdx = ${userIdx} && craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//사용자의 상품 좋아요 추가
async function changeCraftToLike(connection, userIdx, craftIdx){
  const query = `
  INSERT INTO CraftLike(userIdx, craftIdx) VALUES (${userIdx}, ${craftIdx});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품의 총 좋아요 개수
async function getTotalCraftLikeCnt(connection, craftIdx){
  const query = `
  SELECT COUNT(*) as totalLikeCnt FROM CraftLike WHERE craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalLikeCnt'];
}

//현재 아티클 좋아요 status 확인
async function articleLikeStatus(connection, userIdx, articleIdx){
  const query = `
  SELECT IF(EXISTS(SELECT *
    FROM ArticleLike
    WHERE userIdx = ${userIdx} && articleIdx = ${articleIdx}), 'Y', 'N') as isLike;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isLike'];
}

//사용자의 아티클 좋아요 삭제
async function changeArticleToDisLike(connection, userIdx, articleIdx){
  const query = `
  DELETE FROM ArticleLike
  WHERE userIdx = ${userIdx} && articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//사용자의 아티클 좋아요 추가
async function changeArticleToLike(connection, userIdx, articleIdx){
  const query = `
  INSERT INTO ArticleLike(userIdx, articleIdx) VALUES (${userIdx}, ${articleIdx});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//아티클의 총 좋아요 개수
async function getTotalArticleLikeCnt(connection, articleIdx){
  const query = `
  SELECT COUNT(*) as totalLikeCnt FROM ArticleLike WHERE articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalLikeCnt'];
}

//사용자의 좋아요 아티클 목록 정보
async function getLikedArticleInfo(connection, userIdx, startItemIdx, itemPerPage){
  const query = `
  SELECT A.articleIdx,
        A.mainImageUrl,
        A.title,
        A.editorIdx,
        E.nickname                           as                   editorName,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d') as                   createdAt,
        (SELECT createdAt
          FROM ArticleLike
          WHERE userIdx = ${userIdx} && articleIdx = A.articleIdx) likeCreatedAt,
        (SELECT COUNT(*)
          FROM ArticleLike
          WHERE articleIdx = A.articleIdx)    as                   totalLikeCnt
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
  WHERE A.isDeleted = 'N' && A.articleIdx IN (SELECT articleIdx
                                              FROM ArticleLike
                                              WHERE userIdx = ${userIdx}
  )
  ORDER BY likeCreatedAt DESC
  LIMIT ${startItemIdx}, ${itemPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//사용자의 찜한 상품 정보
async function getLikedCraftInfo(connection, userIdx, startItemIdx, LIKED_CRAFT_PER_PAGE){
  const query = `
  SELECT C.craftIdx,
        C.name,
        C.price,
        C.mainImageUrl,
        C.content,
        C.size,
        C.isSoldOut,
        C.artistIdx,
        U.nickname                                                  as artistName,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y')    as isNew,
        (SELECT COUNT(CC.craftCommentIdx)
          FROM CraftComment CC
                  JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          WHERE CC.isDeleted = 'N' && OC.craftIdx = C.craftIdx)      as totalCommentCnt,
        (SELECT COUNT(*)
          FROM CraftLike TCL
          WHERE TCL.craftIdx = C.craftIdx)                           as totalLikeCnt,
        (SELECT CL.createdAt
          FROM CraftLike CL
          WHERE CL.craftIdx = C.craftIdx && CL.userIdx = ${userIdx}) as likedCreatedAt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.craftIdx IN (SELECT craftIdx
                      FROM CraftLike
                      WHERE userIdx = ${userIdx}
  ) && C.isDeleted = 'N'
  ORDER BY likedCreatedAt DESC
  LIMIT ${startItemIdx}, ${LIKED_CRAFT_PER_PAGE};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//현재 QnA 좋아요 status 확인
async function getQnALikeStatus(connection, userIdx, qnaIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM QnALike
    WHERE userIdx = ${userIdx} && qnaIdx = ${qnaIdx}) as isLike;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isLike'];
}

//QnA 좋아요 삭제
async function deleteQnALike(connection, userIdx, qnaIdx){
  const query = `
  DELETE
  FROM QnALike
  WHERE userIdx = ${userIdx} && qnaIdx = ${qnaIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//QnA 좋아요 등록
async function createQnALike(connection, userIdx, qnaIdx){
  const query = `
  INSERT INTO QnALike(userIdx, qnaIdx)
  VALUES (${userIdx}, ${qnaIdx});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//QnA 총 좋아요 개수
async function getTotalQnALikeCnt(connection, qnaIdx){
  const query = `
  SELECT COUNT(*) as totalLikeCnt
  FROM QnALike
  WHERE qnaIdx = ${qnaIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalLikeCnt'];
}

//유저 story 좋아요 여부
async function getStoryLikeStatus(connection, storyIdx, userIdx){
  const query = `
  SELECT EXISTS(SELECT * FROM StoryLike WHERE storyIdx = ${storyIdx} && userIdx = ${userIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//story 좋아요 삭제
async function deleteUserStoryLike(connection, userIdx, storyIdx){
  const query = `
  DELETE FROM StoryLike
  WHERE userIdx = ${userIdx} && storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//story 좋아요 입력
async function createUserStoryLike(connection, userIdx, storyIdx){
  const query = `
  INSERT INTO StoryLike(userIdx, storyIdx)
  VALUES (${userIdx}, ${storyIdx});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//story의 총 좋아요 개수 가져오기
async function getTotalStoryLikeCnt(connection, storyIdx){
  const query = `
  SELECT COUNT(*) as totalLikeCnt FROM StoryLike
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalLikeCnt'];
}

//좋아요한 게시물
async function getLikedPost(connection, userIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT *
  FROM (SELECT SL.storyIdx                                             as idx,
              1                                                       as categoryIdx,
              S.title,
              S.content,
              (SELECT imageUrl
                FROM StoryImage SI
                WHERE SI.storyIdx = SL.storyIdx
                LIMIT 1)                                               as mainImageUrl,
              U.nickname                                              as name,
              DATE_FORMAT(S.createdAt, '%Y.%m.%d. %H:%i')             as createdAt,
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
        SELECT QL.qnaIdx                                                       as idx,
              2                                                               as categoryIdx,
              Q.title,
              Q.content,
              NULL                                                            as mainImageUrl,
              U.nickname                                                      as name,
              DATE_FORMAT(Q.createdAt, '%Y.%m.%d. %H:%i')                     as createdAt,
              QL.createdAt                                                    as originalCreatedAt,
              (SELECT COUNT(*) FROM QnALike WHERE QnALike.qnaIdx = QL.qnaIdx) as totalLikeCnt,
              (SELECT COUNT(qnaCommentIdx)
                FROM QnAComment QC
                WHERE QC.qnaIdx = QL.qnaIdx && QC.isDeleted = 'N')             as totalCommentCnt
        FROM QnALike QL
                JOIN QnA Q ON Q.qnaIdx = QL.qnaIdx && Q.isDeleted = 'N'
                JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
        WHERE QL.userIdx = ${userIdx}
      ) R
  ORDER BY originalCreatedAt DESC
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  craftIsLike,
  changeCraftToDisLike,
  changeCraftToLike,
  getTotalCraftLikeCnt,
  articleLikeStatus,
  changeArticleToDisLike,
  changeArticleToLike,
  getTotalArticleLikeCnt,
  getLikedArticleInfo,
  getLikedCraftInfo,
  getQnALikeStatus,
  deleteQnALike,
  createQnALike,
  getTotalQnALikeCnt,
  getStoryLikeStatus,
  deleteUserStoryLike,
  createUserStoryLike,
  getTotalStoryLikeCnt,
  getLikedPost,
}