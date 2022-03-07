const {CATEGORY} = require('../../../modules/constants');

//사용자 별 최근 검색어 가져오기(15개)
async function getRecentlySearch(connection, userIdx){
  const query = `
  SELECT DISTINCT word
  FROM SearchRecord
  WHERE userIdx = ${userIdx} && isDeleted = 'N'
  ORDER BY searchRecordIdx DESC
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.word);
}

//인기 검색어 가져오기(10개)
async function getPopularSearch(connection){
  const query = `
  SELECT searchIdx, word FROM Search
  ORDER BY count DESC
  LIMIT 10;
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.word);
}

//유효한 user의 search 항목인지
async function isExistUserSearch(connection, userIdx, word){
  const query = `
  SELECT EXISTS(SELECT *
    FROM SearchRecord
    WHERE userIdx = ${userIdx} && word = ? && isDeleted = 'N') AS isExists;
  `;
  const [rows] = await connection.query(query, [word]);
  return rows[0]['isExists'];
}

//사용자 최근검색어 삭제
async function deleteUserRecentlySearch(connection, userIdx, word){
  const query = `
  UPDATE SearchRecord
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx} && word = ?;
  `;
  const [rows] = await connection.query(query, [word]);
  return rows;
}

//user의 지울 검색어가 있는지
async function isExistUserSearchs(connection, userIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM SearchRecord
    WHERE userIdx = ${userIdx} && isDeleted = 'N') AS isExists;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExists'];
}

//user의 최근검색어 전체 삭제
async function deleteAllUserRecentlySearch(connection, userIdx){
  const query = `
  UPDATE SearchRecord
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx};
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
  WHERE C.isDeleted = 'N' && (C.name LIKE CONCAT('%', ?, '%') || U.nickname LIKE CONCAT('%', ?, '%')
            || C.content LIKE CONCAT('%', ?, '%') || CC.name LIKE CONCAT('%', ?, '%'));
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
  WHERE C.isDeleted = 'N' && (CUC.name LIKE CONCAT('%', ?, '%') || CU.etcUsage LIKE CONCAT('%', ?, '%') ||
        CUI.name LIKE CONCAT('%', ?, '%'));
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
  WHERE Q.isDeleted = 'N' && (Q.title LIKE CONCAT('%', ?, '%') || Q.content LIKE CONCAT('%', ?, '%'));
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
  WHERE S.isDeleted = 'N' && (S.title LIKE CONCAT('%', ?, '%') || S.content LIKE CONCAT('%', ?, '%'));
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
  WHERE AB.isDeleted = 'N' && (AB.content LIKE CONCAT('%', ?, '%') || U.nickname LIKE CONCAT('%', ?, '%'));
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
  WHERE A.isDeleted = 'N' && (A.title LIKE CONCAT('%', ?, '%') || A.summary LIKE CONCAT('%', ?, '%') ||
        AC.name LIKE CONCAT('%', ?, '%') || E.nickname LIKE CONCAT('%', ?, '%'));
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
  
  //상품 arr없을 경우 유효하지 않은 값으로 변경
  if (craftCorrespond.length === 0) craftCorrespond = [-1];

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

//상품 정보 가져오기
async function getCraftInfo(connection, userIdx, sort, correspondIdxArr, startItemIdx, itemsPerPage){
  
  if (correspondIdxArr.length === 0) correspondIdxArr = [-1];

  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                                                          as artistName,
        C.price,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y')                            as isNew,
        C.isSoldOut,
        (SELECT COUNT(*)
          FROM CraftLike CL
          WHERE CL.craftIdx = C.craftIdx)                                                    as totalLikeCnt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(SELECT *
                      FROM CraftLike CL
                      WHERE CL.userIdx = ${userIdx} && CL.craftIdx = C.craftIdx), 'Y', 'N')) as isLike,
        (SELECT COUNT(CC.craftCommentIdx)
          FROM CraftComment CC
                  JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          WHERE CC.isDeleted = 'N' && OC.craftIdx = C.craftIdx)                              as totalCommentCnt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N' && C.craftIdx IN (?)
  ORDER BY (CASE WHEN ? = 'new' THEN C.createdAt END) ASC,
          (CASE WHEN ? = 'popular' THEN totalLikeCnt END) ASC,
          (CASE WHEN ? = 'comment' THEN totalCommentCnt END) ASC,
          (CASE WHEN ? = 'price' THEN price END) DESC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query, [correspondIdxArr, sort, sort, sort, sort]);
  return rows;
}

//아티클 정보 가져오기
async function getArticleInfo(connection, userIdx, sort, correspondIdxArr, startItemIdx, itemsPerPage){

  if (correspondIdxArr.length === 0) correspondIdxArr = [-1];

  const query = `
  SELECT A.articleIdx,
        A.title,
        A.mainImageUrl,
        A.editorIdx,
        E.nickname                                                                              as editorName,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d')                                                    as createdAt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(SELECT *
                      FROM ArticleLike AL
                      WHERE AL.userIdx = ${userIdx} && AL.articleIdx = A.articleIdx), 'Y', 'N')) as isLike,
        (SELECT COUNT(*)
          FROM ArticleLike
          WHERE articleIdx = A.articleIdx)                                                       AS totalLikeCnt
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
  WHERE A.isDeleted = 'N' && A.articleIdx IN (?)
  ORDER BY (CASE WHEN ? = 'new' THEN A.articleIdx END) ASC,
          (CASE WHEN ? = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query, [correspondIdxArr, sort, sort]);
  return rows;
}

//with 정보 가져오기
async function getWithInfo(connection, userIdx, sort, storyIdxArr, qnaIdxArr, abTestIdxArr, startItemIdx, itemsPerPage){
  
  if (storyIdxArr.length === 0) storyIdxArr = [-1];
  if (qnaIdxArr.length === 0) qnaIdxArr = [-1];
  if (abTestIdxArr.length === 0) abTestIdxArr = [-1];

  const query = `
  SELECT *
  FROM (
          SELECT S.storyIdx                                                                          as idx,
                  ${CATEGORY.STORY}                                                                   as categoryIdx,
                  (SELECT imageUrl
                  FROM StoryImage SI
                  WHERE SI.storyIdx = S.storyIdx
                  LIMIT 1)                                                                           as mainImageUrl,
                  S.title,
                  S.content,
                  U.nickname                                                                          as name,
                  DATE_FORMAT(S.createdAt, '%Y.%m.%d. %H:%i')                                         as createdAt,
                  S.createdAt                                                                         as originalCreatedAt,
                  (SELECT COUNT(*)
                  FROM StoryLike SL
                  WHERE SL.storyIdx = S.storyIdx)                                                    as totalLikeCnt,
                  IF(${userIdx} = -1, 'N',
                    IF(EXISTS(SELECT *
                              FROM StoryLike SL
                              WHERE SL.userIdx = ${userIdx} && SL.storyIdx = S.storyIdx), 'Y', 'N')) as isLike,
                  (SELECT COUNT(*)
                  FROM StoryComment SC
                  WHERE SC.storyIdx = S.storyIdx && SC.isDeleted = 'N')                              as totalCommentCnt
          FROM Story S
                    JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
          WHERE S.isDeleted = 'N' && S.storyIdx IN (?)
          UNION ALL
          SELECT Q.qnaIdx                                                                        as idx,
                  ${CATEGORY.QNA}                                                                 as categoryIdx,
                  NULL                                                                            as mainImageUrl,
                  Q.title,
                  Q.content,
                  U.nickname                                                                      as name,
                  DATE_FORMAT(Q.createdAt, '%Y.%m.%d. %H:%i')                                     as createdAt,
                  Q.createdAt                                                                     as originalCreatedAt,
                  (SELECT COUNT(*)
                  FROM QnALike QL
                  WHERE QL.qnaIdx = Q.qnaIdx)                                                    as totalLikeCnt,
                  IF(${userIdx} = -1, 'N',
                    IF(EXISTS(SELECT *
                              FROM QnALike QL
                              WHERE QL.qnaIdx = Q.qnaIdx && QL.userIdx = ${userIdx}), 'Y', 'N')) as isLike,
                  (SELECT COUNT(*)
                  FROM QnAComment QC
                  WHERE QC.qnaIdx = Q.qnaIdx && QC.isDeleted = 'N')                              as totalCommentCnt
          FROM QnA Q
                    JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
          WHERE Q.isDeleted = 'N' && Q.qnaIdx IN (?)
          UNION ALL
          SELECT AB.abTestIdx                                                as idx,
                  ${CATEGORY.ABTEST}                                          as categoryIdx,
                  NULL                                                        as mainImageUrl,
                  NULL                                                        as title,
                  AB.content,
                  U.nickname                                                  as name,
                  DATE_FORMAT(AB.createdAt, '%Y.%m.%d. %H:%i')                as createdAt,
                  AB.createdAt                                                as originalCreatedAt,
                  NULL                                                        as totalLikeCnt,
                  NULL                                                        as isLike,
                  (SELECT COUNT(*)
                  FROM ABTestComment ABC
                  WHERE ABC.isDeleted = 'N' && ABC.abTestIdx = AB.abTestIdx) as totalCommentCnt
          FROM ABTest AB
                    JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                    JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
          WHERE AB.isDeleted = 'N' && AB.abTestIdx IN (?)
      ) R
  ORDER BY (CASE WHEN ? = 'new' THEN R.originalCreatedAt END) ASC,
          (CASE WHEN ? = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query, [storyIdxArr, qnaIdxArr, abTestIdxArr, sort, sort]);
  return rows;
}

//검색어 기록
async function createSearchRecord(connection, userIdx, clientIp, keyword){
  let query;
  if (userIdx !== -1){
    query = `
    INSERT INTO SearchRecord (userIdx, ip, word)
    VALUES (${userIdx}, ?, ?);
    `;
  }
  else{
    query = `
    INSERT INTO SearchRecord (ip, word)
    VALUES (?, ?);
    `
  }
  const [rows] = await connection.query(query, [clientIp, keyword]);
  return rows;
}

//검색어 순위에 반영 가능한지(한 ip는 하루에 한 번만 가능)
async function canReflectSearchCnt(connection, clientIp, keyword){
  const query = `
  SELECT NOT EXISTS(SELECT *
    FROM SearchCntRecord
    WHERE ip = ? && word = ? && DATEDIFF(NOW(), createdAt) = 0) && NOT EXISTS(SELECT *
                                                                              FROM (SELECT word
                                                                                    FROM Search
                                                                                    LIMIT 10) R
                                                                              WHERE word = ?) AS canReflect;
  `;
  const [rows] = await connection.query(query, [clientIp, keyword, keyword]);
  return rows[0]['canReflect'];
}

//검색어 횟수 기록
async function updateSearchCntRecord(connection, clientIp, keyword){
  const query = `
  INSERT INTO SearchCntRecord (word, ip)
  VALUES (?, ?);
  `;
  const [rows] = await connection.query(query, [keyword, clientIp]);
  return rows;
}

//Search에 존재하는지
async function isExistSearch(connection, keyword, clientIp){
  const query = `
  SELECT EXISTS(SELECT *
    FROM Search
    WHERE word = ?) AS isExists;
  `;
  const [rows] = await connection.query(query, [keyword, clientIp]);
  return rows[0]['isExists'];
}

//인기 검색어 cnt 증가
async function updateSearch(connection, keyword){
  const query = `
  UPDATE Search
  SET count = count + 1
  WHERE word = ?;
  `;
  const [rows] = await connection.query(query, [keyword]);
  return rows;
}

//인기 검색어 추가
async function insertSearch(connection, keyword){
  const query = `
  INSERT INTO Search (word)
  VALUES (?);
  `;
  const [rows] = await connection.query(query, [keyword]);
  return rows;
}

module.exports = {
  getRecentlySearch,
  getPopularSearch,
  isExistUserSearch,
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
  getCraftInfo,
  getArticleInfo,
  getWithInfo,
  createSearchRecord,
  canReflectSearchCnt,
  updateSearchCntRecord,
  isExistSearch,
  updateSearch,
  insertSearch,
}