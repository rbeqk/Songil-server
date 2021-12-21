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
  SELECT EXISTS(SELECT *
    FROM ArticleLike
    WHERE userIdx = ${userIdx} && articleIdx = ${articleIdx}) as isLike
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

//사용자의 좋아요 아티클 개수
async function getLikedArticleTotalCnt(connection, params){
  const query = `
  SELECT COUNT(*) as totalCnt FROM ArticleLike
  WHERE userIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}
//사용자의 좋아요 아티클 목록
async function getLikedArticleIdx(connection, params){
  const query = `
  SELECT articleIdx FROM ArticleLike
  WHERE userIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자의 좋아요 아티클 목록 정보
async function getLikedArticleInfo(connection, params){
  const query = `
  SELECT A.articleIdx,
        A.mainImageUrl,
        A.title,
        A.editorIdx,
        E.nickname                                  as editorName,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d') as createdAt,
        IFNULL(AL.totalLikeCnt, 0)                  as totalLikeCnt,
        (SELECT createdAt FROM ArticleLike WHERE userIdx = ? && articleIdx = A.articleIdx) likeCreatedAt
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
          LEFT JOIN (SELECT articleIdx, COUNT(*) as totalLikeCnt
                      FROM ArticleLike
                      GROUP BY articleIdx) as AL ON AL.articleIdx = A.articleIdx
  WHERE A.isDeleted = 'N' && A.articleIdx IN (?)
  ORDER BY likeCreatedAt
  LIMIT ?, ?
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자의 찜한 상품 개수
async function getLikedCraftTotalCnt(connection, params){
  const query = `
  SELECT COUNT(*) as totalCnt FROM CraftLike
  WHERE userIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}

//사용자의 찜한 상품 정보
async function getLikedCraftInfo(connection, params){
  const query = `
  SELECT C.craftIdx,
        C.name,
        C.price,
        C.mainImageUrl,
        C.content,
        C.size,
        C.isSoldOut,
        C.artistIdx,
        U.nickname                                               as artistName,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y') as isNew,
        (SELECT COUNT(craftCommentIdx)
          FROM CraftComment CC
          WHERE CC.craftIdx = C.craftIdx && CC.isDeleted = 'N')   as totalCommentCnt,
        (SELECT COUNT(*)
          FROM CraftLike TCL
          WHERE TCL.craftIdx = C.craftIdx)                        as totalLikeCnt,
        (SELECT CL.createdAt
          FROM CraftLike CL
          WHERE CL.craftIdx = C.craftIdx && CL.userIdx = ?)       as likedCreatedAt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.craftIdx IN (SELECT craftIdx
                      FROM CraftLike
                      WHERE userIdx = ?
  ) && C.isDeleted = 'N'
  ORDER BY likedCreatedAt
  LIMIT ?, ?;
  `;
  const [rows] = await connection.query(query, params);
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

module.exports = {
  craftIsLike,
  changeCraftToDisLike,
  changeCraftToLike,
  getTotalCraftLikeCnt,
  articleLikeStatus,
  changeArticleToDisLike,
  changeArticleToLike,
  getTotalArticleLikeCnt,
  getLikedArticleTotalCnt,
  getLikedArticleIdx,
  getLikedArticleInfo,
  getLikedCraftTotalCnt,
  getLikedCraftInfo,
  getQnALikeStatus,
  deleteQnALike,
  createQnALike,
  getTotalQnALikeCnt,
  getStoryLikeStatus,
  deleteUserStoryLike,
  createUserStoryLike,
  getTotalStoryLikeCnt,
}