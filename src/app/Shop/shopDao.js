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

module.exports = {
  getTodayCraftTotalCnt,
  getTodayCraft,
}