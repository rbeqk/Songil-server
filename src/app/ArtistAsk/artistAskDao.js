//작가 여부
async function isArtist(connection, params){
  const query = `
  SELECT EXISTS(SELECT userIdx
    FROM User
    WHERE isDeleted = 'N' && isArtist = 'Y' && userIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//작가idx
async function getArtistIdx(connection, params){
  const query = `
  SELECT artistIdx FROM Artist
  WHERE isDeleted = 'N' && userIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['artistIdx'];
}

//작가의 총 1:1문의 개수
async function getAskCnt(connection, params){
  const query = `
  SELECT COUNT(PA.productAskIdx) as totalCnt
  FROM ProductAsk PA
            JOIN Product P ON P.productIdx = PA.productIdx && P.isDeleted = 'N'
  WHERE PA.isDeleted = 'N' && P.artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}

module.exports = {
  isArtist,
  getArtistIdx,
  getAskCnt,
}