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

module.exports = {
  getTodayCraftTotalCnt,
  getTodayCraft,
  getTotalBannerCnt,
  getBanner,
  getTodayArtist,
  getNewCraft,
}