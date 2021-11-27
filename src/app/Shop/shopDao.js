//today-craft 총 개수(=상품 총 개수)
async function getTodayCraftTotalCnt(connection){
  const query = `
  SELECT COUNT(productIdx) as totalCnt
  FROM Product
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//today-craft 가져오기
async function getTodayCraft(connection, params){
  const query = `
  SELECT P.productIdx,
        P.mainImageUrl,
        P.name,
        A.artistIdx,
        A.artistIdx,
        U.nickname                                               as artistName,
        P.price,
        IF(TIMESTAMPDIFF(DAY, P.createdAt, NOW()) > 3, 'N', 'Y') as isNew
  FROM Product P
          JOIN Artist A ON A.artistIdx = P.artistIdx && A.isDeleted = 'N'
          JOIN User U ON A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE P.isDeleted = 'N'
  ORDER BY RAND(0)
  LIMIT ?, ?
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//총 banner 개수 가져오기
async function getTotalBannerCnt(connection){
  const query = `
  SELECT COUNT(imageUrl) as totalCnt FROM ShopBanner
  WHERE isDeleted = 'N'
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//banner 가져오기
async function getBanner(connection){
  const query = `
  SELECT shopBannerIdx, imageUrl FROM ShopBanner
  WHERE isDeleted = 'N'
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//today artist 가져오기
async function getTodayArtist(connection){
  const query = `
  SELECT A.artistIdx, U.nickname as artistName, U.imageUrl, A.major
  FROM User U
  JOIN Artist A on A.userIdx = U.userIdx
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
  SELECT productIdx, mainImageUrl
  FROM Product
  WHERE isDeleted = 'N'
  ORDER BY productIdx DESC
  LIMIT 9;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//사용자 별 최근 검색어 가져오기(15개)
async function getRecentlySearch(connection, params){
  const query = `
  SELECT S.searchIdx, S.word
  FROM UserSearch US
          JOIN Search S ON S.searchIdx = US.searchIdx
  WHERE US.userIdx = ? && US.isDeleted = 'N'
  ORDER BY US.userSearchIdx DESC
  LIMIT 15
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//인기 검색어 가져오기(10개)
async function getPopularSearch(connection, params){
  const query = `
  SELECT searchIdx, word FROM Search
  ORDER BY count DESC
  LIMIT 10
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//유효한 userSearchIdx인지
async function isExistUserSearchIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT userSearchIdx
    FROM UserSearch
    WHERE userIdx = ? && userSearchIdx = ? && isDeleted = 'N') as isExist
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//사용자 최근검색어 삭제
async function deleteUserRecentlySearch(connection, params){
  const query = `
  UPDATE UserSearch
  SET isDeleted = 'Y'
  WHERE userSearchIdx = ?
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  getTodayCraftTotalCnt,
  getTodayCraft,
  getTotalBannerCnt,
  getBanner,
  getTodayArtist,
  getNewCraft,
  getRecentlySearch,
  getPopularSearch,
  isExistUserSearchIdx,
  deleteUserRecentlySearch,
}