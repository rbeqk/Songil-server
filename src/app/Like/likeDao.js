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

module.exports = {
  productIsLike,
  changeProductToDisLike,
  changeProductToLike,
  getTotalProductLikeCnt,
  articleLikeStatus,
  changeArticleToDisLike,
  changeArticleToLike,
  getTotalArticleLikeCnt,
}