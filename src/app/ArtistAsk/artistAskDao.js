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
  SELECT COUNT(CA.craftAskIdx) as totalCnt
  FROM CraftAsk CA
          JOIN Craft C ON C.craftIdx = CA.craftIdx
  WHERE CA.isDeleted = 'N' && C.artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}

//작가 1:1문의 목록 가져오기(삭제된 상품에 대해서도 보이게)
async function getAskList(connection, params){
  const query = `
  SELECT CA.craftAskIdx as askIdx
  FROM CraftAsk CA
          JOIN Craft C ON C.craftIdx = CA.craftIdx
  WHERE CA.isDeleted = 'N' && C.artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//문의 목록 상세 정보 가져오기
async function getAskInfo(connection, params){
  const query = `
  SELECT CA.craftAskIdx                               as askIdx,
        CA.craftIdx,
        C.name,
        C.mainImageUrl,
        U.nickname,
        CA.craftAskStatusIdx                         as status,
        DATE_FORMAT(CA.createdAt, '%Y.%m.%d. %k:%i') as createdAt
  FROM CraftAsk CA
          JOIN Craft C ON C.craftIdx = CA.craftIdx
          JOIN User U ON U.userIdx = CA.userIdx && U.isDeleted = 'N'
  WHERE CA.craftAskIdx IN (?) && CA.isDeleted = 'N'
  ORDER BY CA.createdAt
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