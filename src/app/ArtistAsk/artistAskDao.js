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
            JOIN Product P ON P.productIdx = PA.productIdx
  WHERE PA.isDeleted = 'N' && P.artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}

//작가 1:1문의 목록 가져오기(삭제된 상품에 대해서도 보이게)
async function getAskList(connection, params){
  const query = `
  SELECT PA.productAskIdx as askIdx
  FROM ProductAsk PA
            JOIN Product P ON P.productIdx = PA.productIdx
  WHERE PA.isDeleted = 'N' && P.artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//문의 목록 상세 정보 가져오기
async function getAskInfo(connection, params){
  const query = `
  SELECT PA.productAskIdx as askIdx,
        PA.productIdx,
        P.name           as productName,
        P.mainImageUrl,
        U.nickname,
        PA.productAskStatusIdx as status,
        DATE_FORMAT(PA.createdAt, '%Y.%m.%d. %k:%i') as                                     createdAt
  FROM ProductAsk PA
          JOIN Product P ON P.productIdx = PA.productIdx
          JOIN User U ON U.userIdx = PA.userIdx && U.isDeleted = 'N'
  WHERE PA.productAskIdx IN (?) && PA.isDeleted = 'N'
  ORDER BY PA.createdAt
  LIMIT ?, ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  isArtist,
  getArtistIdx,
  getAskCnt,
  getAskList,
  getAskInfo,
}