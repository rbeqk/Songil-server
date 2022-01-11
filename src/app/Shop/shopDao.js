//today-craft 가져오기
async function getTodayCraft(connection){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        A.artistIdx,
        A.artistIdx,
        U.nickname                                               as artistName,
        C.price,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y') as isNew
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N'
  ORDER BY RAND()
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//banner 가져오기
async function getBanner(connection){
  const query = `
  SELECT shopBannerIdx as bannerIdx, imageUrl
  FROM ShopBanner
  WHERE isDeleted = 'N'
  ORDER BY bannerIdx DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//today artist 가져오기(가장 최근 등록 작가)
async function getTodayArtist(connection){
  const query = `
  SELECT A.artistIdx, U.nickname as artistName, U.imageUrl, A.major
  FROM User U
  JOIN Artist A on A.userIdx = U.userIdx && A.isDeleted = 'N'
  WHERE U.isDeleted = 'N' && U.isArtist = 'Y'
  ORDER BY U.userIdx DESC
  LIMIT 1;
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//new craft 가져오기
async function getNewCraft(connection){
  const query = `
  SELECT craftIdx, mainImageUrl
  FROM Craft
  WHERE isDeleted = 'N'
  ORDER BY craftIdx DESC
  LIMIT 9;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//카테고리 별 상품 개수
async function getCraftByCategoryCnt(connection, craftCategoryIdx){
  const query = `
  SELECT COUNT(craftIdx) as totalCnt FROM Craft
  WHERE craftCategoryIdx = ${craftCategoryIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//전체 상품 개수 가져오기
async function getTotalCraftCnt(connection){
  const query = `
  SELECT COUNT(craftIdx) as totalCnt FROM Craft
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//카테고리 별 인기 상품 가져오기
async function getWeeklyPopularCraftByCategory(connection, categoryIdx){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                               as artistName,
        C.price,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y') as isNew
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N' && C.isSoldOut = 'N' && C.craftCategoryIdx = ${categoryIdx}
  ORDER BY RAND()
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//전체 상품에서 인기 상품 가져오기
async function getWeeklyPopularCraft(connection){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                               as artistName,
        C.price,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y') as isNew
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N' && C.isSoldOut = 'N'
  ORDER BY RAND()
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//카테고리 별 상품 목록 가져오기
async function getCraftByCategory(connection, userIdx, craftCategoryIdx, startItemIdx, itemsPerPage, sort){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                                                            as artistName,
        C.price,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y')                              as isNew,
        C.isSoldOut,
        (SELECT COUNT(*)
          FROM CraftLike CL
          WHERE CL.craftIdx = C.craftIdx)                                                      as totalLikeCnt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(SELECT *
                      FROM CraftLike CL2
                      WHERE CL2.userIdx = ${userIdx} && CL2.craftIdx = C.craftIdx), 'Y', 'N')) as isLike,
        (SELECT COUNT(*)
          FROM CraftComment CC
          WHERE CC.craftIdx = C.craftIdx && CC.isDeleted = 'N')                                as totalCommentCnt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.craftCategoryIdx = ${craftCategoryIdx} && C.isDeleted = 'N'
  ORDER BY (CASE WHEN '${sort}' = 'new' THEN C.createdAt END) ASC,
          (CASE WHEN '${sort}' = 'price' THEN C.price END) DESC,
          (CASE WHEN '${sort}' = 'comment' THEN totalCommentCnt END) ASC,
          (CASE WHEN '${sort}' = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query, [sort, sort, sort, sort]);
  return rows;
}

//전체 상품 목록 가져오기
async function getAllCraft(connection, userIdx, startItemIdx, itemsPerPage, sort){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                                                            as artistName,
        C.price,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y')                              as isNew,
        C.isSoldOut,
        (SELECT COUNT(*)
          FROM CraftLike CL
          WHERE CL.craftIdx = C.craftIdx)                                                      as totalLikeCnt,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(SELECT *
                      FROM CraftLike CL2
                      WHERE CL2.userIdx = ${userIdx} && CL2.craftIdx = C.craftIdx), 'Y', 'N')) as isLike,
        (SELECT COUNT(*)
          FROM CraftComment CC
          WHERE CC.craftIdx = C.craftIdx && CC.isDeleted = 'N')                                as totalCommentCnt
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N'
  ORDER BY (CASE WHEN ? = 'new' THEN C.createdAt END) ASC,
          (CASE WHEN ? = 'price' THEN C.price END) DESC,
          (CASE WHEN ? = 'comment' THEN totalCommentCnt END) ASC,
          (CASE WHEN ? = 'popular' THEN totalLikeCnt END) ASC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query, [sort, sort, sort, sort]);
  return rows;
}

module.exports = {
  getTodayCraft,
  getBanner,
  getTodayArtist,
  getNewCraft,
  getCraftByCategoryCnt,
  getTotalCraftCnt,
  getWeeklyPopularCraftByCategory,
  getWeeklyPopularCraft,
  getCraftByCategory,
  getAllCraft,
}