//아티클 리스트 가져오기(최신순 15개까지)
async function getArticleList(connection){
  const query = `
  SELECT A.articleIdx,
        A.articleCategoryIdx,
        A.title,
        A.editorIdx,
        E.nickname                                  as editorName,
        A.mainImageUrl,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d. %k:%i') as createdAt
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
  WHERE A.isDeleted = 'N'
  ORDER BY A.createdAt DESC
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//존재하는 articleIdx인지
async function isExistArticleIdx(connection, articleIdx){
  const query = `
  SELECT EXISTS(SELECT * FROM Article WHERE isDeleted = 'N' && articleIdx = ${articleIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//아티클 기본 정보 가져오기
async function getArticleDetail(connection, articleIdx, userIdx){
  const query = `
  SELECT A.articleIdx,
        A.articleCategoryIdx,
        A.mainImageUrl,
        A.title,
        A.editorIdx,
        E.nickname                                                                   as editorName,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d. %k:%i')                                  as createdAt,
        (SELECT COUNT(*)
          FROM ArticleLike
          WHERE articleIdx = ${articleIdx})                                           as totalLikeCnt,
        EXISTS(SELECT *
                FROM ArticleLike
                WHERE articleIdx = ${articleIdx} && ArticleLike.userIdx = ${userIdx}) as isLike
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
  WHERE A.isDeleted = 'N' && A.articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//아티클 내용 가져오기
async function getArticleContent(connection, articleIdx){
  const query = `
  SELECT contentIdx, content
  FROM ArticleContent
  WHERE isDeleted = 'N' && articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//아티클 상세사진 가져오기
async function getArticelDetailImage(connection, articleIdx){
  const query = `
  SELECT imageUrl, contentIdx
  FROM ArticleDetailImage
  WHERE isDeleted = 'N' && articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//아티클 관련상품 가져오기(삭제된 상품도 보이게)
async function getArticleReatedCraft(connection, articleIdx){
  const query = `
  SELECT AC.craftIdx, C.mainImageUrl, C.name, C.artistIdx, U.nickname as artistName, AC.contentIdx, C.price
  FROM ArticleCraft AC
          JOIN Craft C on AC.craftIdx = C.craftIdx
          JOIN Artist A on C.artistIdx = A.artistIdx
          JOIN User U on A.userIdx = U.userIdx
  WHERE AC.isDeleted = 'N' && AC.articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//아티클 관련 태그 가져오기
async function getArticleTag(connection, articleIdx){
  const query = `
  SELECT tag FROM ArticleTag
  WHERE articleIdx = ${articleIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//연관 아티클 가져오기(자기 제외 3개 랜덤)
async function getArticleRelatedArticle(connection, articleIdx){
  const query = `
  SELECT A.articleIdx,
        A.mainImageUrl,
        A.title,
        A.editorIdx,
        E.nickname as editorName
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
  WHERE A.isDeleted = 'N' && A.articleIdx != ${articleIdx}
  ORDER BY RAND(1)
  LIMIT 3;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getArticleList,
  isExistArticleIdx,
  getArticleDetail,
  getArticleContent,
  getArticelDetailImage,
  getArticleReatedCraft,
  getArticleTag,
  getArticleRelatedArticle,
}