const {CATEGORY} = require('../../../modules/constants');

//사용자 별 최근 검색어 가져오기(15개)
async function getRecentlySearch(connection, userIdx){
  const query = `
  SELECT S.searchIdx, S.word
  FROM UserSearch US
          JOIN Search S ON S.searchIdx = US.searchIdx
  WHERE US.userIdx = ${userIdx} && US.isDeleted = 'N'
  ORDER BY US.updatedAt DESC
  LIMIT 15
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//인기 검색어 가져오기(10개)
async function getPopularSearch(connection){
  const query = `
  SELECT searchIdx, word FROM Search
  ORDER BY count DESC
  LIMIT 10
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//word의 searchIdx가져오기
async function getSearchIdx(connection, word){
  const query = `
  SELECT searchIdx FROM Search
  WHERE word = '${word}';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유효한 user의 search 항목인지
async function isExistUserSearchIdx(connection, userIdx, searchIdx){
  const query = `
  SELECT EXISTS(SELECT userSearchIdx
    FROM UserSearch
    WHERE userIdx = ${userIdx} && searchIdx = ${searchIdx} && isDeleted = 'N') as isExist
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//사용자 최근검색어 삭제
async function deleteUserRecentlySearch(connection, userIdx, searchIdx){
  const query = `
  UPDATE UserSearch
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx} && searchIdx = ${searchIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//user의 지울 검색어가 있는지
async function isExistUserSearchs(connection, userIdx){
  const query = `
  SELECT EXISTS(SELECT userSearchIdx
    FROM UserSearch
    WHERE userIdx = ${userIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//user의 최근검색어 전체 삭제
async function deleteAllUserRecentlySearch(connection, userIdx){
  const query = `
  UPDATE UserSearch
  SET isDeleted = 'Y'
  WHERE isDeleted = 'N' && userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작가명, 상품명, 상품 설명, 스토어 카테고리에 해당 키워드 들어가있는 상품 가져오기
async function getCraftCorrespondToBasic(connection, keyword){
  const query = `
  SELECT C.craftIdx
  FROM Craft C
          JOIN CraftCategory CC ON CC.craftCategoryIdx = C.craftCategoryIdx
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.name LIKE CONCAT('%', ?, '%') || U.nickname LIKE CONCAT('%', ?, '%')
            || C.content LIKE CONCAT('%', ?, '%') || CC.name LIKE CONCAT('%', ?, '%') && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [keyword, keyword, keyword, keyword]);
  return rows.map(item => item.craftIdx); 
}

//소재에 해당 키워드 들어가있는 상품 가져오기
async function getCraftCorrespondToMaterial(connection, keyword){
  const query = `
  SELECT DISTINCT C.craftIdx
  FROM Craft C
          JOIN CraftMaterial CM on C.craftIdx = CM.craftIdx
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE CM.material LIKE CONCAT('%', ?, '%') && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [keyword]);
  return rows.map(item => item.craftIdx);
}

//용도 아이템에 해당 키워드 들어가있는 상품 가져오기
async function getCraftCorrespondToUsage(connection, keyword){
  const query = `
  SELECT DISTINCT C.craftIdx
  FROM Craft C
          JOIN CraftUsage CU ON CU.craftIdx = C.craftIdx
          JOIN CraftUsageItem CUI ON CUI.craftUsageItemIdx = CU.craftUsageItemIdx
          JOIN CraftUsageCategory CUC on CUC.craftUsageCategoryIdx = CUI.craftUsageCategoryIdx
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE CUC.name LIKE CONCAT('%', ?, '%') || CU.etcUsage LIKE CONCAT('%', ?, '%') ||
        CUI.name LIKE CONCAT('%', ?, '%') && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [keyword, keyword, keyword]);
  return rows.map(item => item.craftIdx);
}

//qna 검색
async function getQnACorrespond(connection, keyword){
  const query = `
  SELECT ${CATEGORY.QNA} AS categoryIdx, Q.qnaIdx
  FROM QnA Q
          JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
  WHERE Q.title LIKE CONCAT('%', ?, '%') || Q.content LIKE CONCAT('%', ?, '%') && Q.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [keyword, keyword, keyword]);
  return rows;
}

//story 검색
async function getStoryCorrespond(connection, keyword){
  const query = `
  SELECT ${CATEGORY.STORY} AS categoryIdx, S.storyIdx
  FROM Story S
          JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
  WHERE S.title LIKE CONCAT('%', ?, '%') || S.content LIKE CONCAT('%', ?, '%') && S.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [keyword, keyword, keyword]);
  return rows;
}

//abtest 검색
async function getAbTewstCorrespond(connection, keyword){
  const query = `
  SELECT ${CATEGORY.ABTEST} AS categoryIdx, AB.abTestIdx
  FROM ABTest AB
          JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE AB.isDeleted = 'N' && AB.content LIKE CONCAT('%', ?, '%') || U.nickname LIKE CONCAT('%', ?, '%');
  `;
  const [rows] = await connection.query(query, [keyword, keyword]);
  return rows;
}

//제목, 요약, 카테고리명, 에디터 이름으로 아티클 검색
async function getArticleCorrspondToBasic(connection, keyword){
  const query = `
  SELECT A.articleIdx, A.title, A.summary, AC.name, E.nickname
  FROM Article A
          JOIN ArticleCategory AC ON A.articleCategoryIdx = AC.articleCategoryIdx
          JOIN Editor E on E.editorIdx = A.editorIdx
  WHERE A.isDeleted = 'N' && A.title LIKE CONCAT('%', ?, '%') || A.summary LIKE CONCAT('%', ?, '%') ||
        AC.name LIKE CONCAT('%', ?, '%') || E.nickname LIKE CONCAT('%', ?, '%');
  `;
  const [rows] = await connection.query(query, [keyword, keyword, keyword, keyword]);
  return rows.map(item => item.articleIdx);
}

//태그로 아티클 검색
async function getArticleCorrespondToTag(connection, keyword){
  const query = `
  SELECT DISTINCT A.articleIdx
  FROM Article A
          LEFT JOIN ArticleTag AT ON AT.articleIdx = A.articleIdx
  WHERE A.isDeleted = 'N' && AT.tag LIKE CONCAT('%', ?, '%');
  `;
  const [rows] = await connection.query(query, [keyword]);
  return rows.map(item => item.articleIdx);
}

//상품 포함하고 있는 아티클 검색
async function getArticleCorrespondToCraft(connection, craftCorrespond){
  const query = `
  SELECT DISTINCT A.articleIdx
  FROM Article A
          LEFT JOIN ArticleCraft AC ON AC.articleIdx = A.articleIdx
  WHERE A.isDeleted = 'N' && AC.craftIdx IN (?);
  `;
  const [rows] = await connection.query(query, [craftCorrespond]);
  return rows.map(item => item.articleIdx);
}

//내용으로 아티클 검색
async function getArticleCorrespondToContent(connection, keyword){
  const query = `
  SELECT DISTINCT A.articleIdx
    FROM Article A
            LEFT JOIN ArticleContent AC on A.articleIdx = AC.articleIdx
    WHERE A.isDeleted = 'N' && AC.content LIKE CONCAT('%', ?, '%');
  `;
  const [rows] = await connection.query(query, [keyword]);
  return rows.map(item => item.articleIdx);
}

module.exports = {
  getRecentlySearch,
  getPopularSearch,
  getSearchIdx,
  isExistUserSearchIdx,
  deleteUserRecentlySearch,
  isExistUserSearchs,
  deleteAllUserRecentlySearch,
  getCraftCorrespondToBasic,
  getCraftCorrespondToMaterial,
  getCraftCorrespondToUsage,
  getQnACorrespond,
  getStoryCorrespond,
  getAbTewstCorrespond,
  getArticleCorrspondToBasic,
  getArticleCorrespondToTag,
  getArticleCorrespondToCraft,
  getArticleCorrespondToContent,
}