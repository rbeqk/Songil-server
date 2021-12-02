//현재 사용자의 상품 좋아요 상태 가져오기
async function productIsLike(connection, params){
  const query = `
  SELECT EXISTS(SELECT *
  FROM ProductLike
  WHERE userIdx = ? && productIdx = ?) as isLike;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isLike'];
}

//사용자의 상품 좋아요 삭제
async function changeProductToDisLike(connection, params){
  const query = `
  DELETE FROM ProductLike
  WHERE userIdx = ? && productIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자의 상품 좋아요 추가
async function changeProductToLike(connection, params){
  const query = `
  INSERT INTO ProductLike(userIdx, productIdx) VALUES (?, ?);
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//상품의 총 좋아요 개수
async function getTotalProductLikeCnt(connection, params){
  const query = `
  SELECT COUNT(*) as totalLikeCnt FROM ProductLike WHERE productIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalLikeCnt'];
}

//현재 아티클 좋아요 status 확인
async function articleLikeStatus(connection, params){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ArticleLike
    WHERE userIdx = ? && articleIdx = ?) as isLike
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isLike'];
}

//사용자의 아티클 좋아요 삭제
async function changeArticleToDisLike(connection, params){
  const query = `
  DELETE FROM ArticleLike
  WHERE userIdx = ? && articleIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자의 아티클 좋아요 추가
async function changeArticleToLike(connection, params){
  const query = `
  INSERT INTO ArticleLike(userIdx, articleIdx) VALUES (?, ?);
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//아티클의 총 좋아요 개수
async function getTotalArticleLikeCnt(connection, params){
  const query = `
  SELECT COUNT(*) as totalLikeCnt FROM ArticleLike WHERE articleIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
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


module.exports = {
  productIsLike,
  changeProductToDisLike,
  changeProductToLike,
  getTotalProductLikeCnt,
  articleLikeStatus,
  changeArticleToDisLike,
  changeArticleToLike,
  getTotalArticleLikeCnt,
  getLikedArticleTotalCnt,
  getLikedArticleIdx,
  getLikedArticleInfo,
}