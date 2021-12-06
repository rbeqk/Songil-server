//today-craft 총 개수(=상품 총 개수)
async function getTodayCraftTotalCnt(connection){
  const query = `
  SELECT COUNT(craftIdx) as totalCnt
  FROM Craft
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//today-craft 가져오기
async function getTodayCraft(connection, params){
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
  LIMIT ?, ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
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
  SELECT craftIdx, mainImageUrl
  FROM Craft
  WHERE isDeleted = 'N'
  ORDER BY craftIdx DESC
  LIMIT 9;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getTodayCraftTotalCnt,
  getTodayCraft,
  getBanner,
  getTodayArtist,
  getNewCraft,
}