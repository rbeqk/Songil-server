//존재하는 artistIdx인지
async function isExistArtistIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT artistIdx
    FROM Artist
    WHERE isDeleted = 'N' && artistIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//작가 기본 정보
async function getArtistInfo(connection, params){
  const query = `
  SELECT A.artistIdx, U.nickname as name, U.imageUrl, A.introduction, A.company, A.major
  FROM Artist A
          JOIN User U on A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE A.isDeleted = 'N' && A.artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0];
}

//작가 약력
async function getArtistProfile(connection, params){
  const query = `
  SELECT content FROM ArtistProfile
  WHERE isDeleted = 'N' && artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//작가 전시정보
async function getArtistExhibition(connection, params){
  const query = `
  SELECT content FROM ArtistExhibition
  WHERE isDeleted = 'N' && artistIdx = ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  isExistArtistIdx,
  getArtistInfo,
  getArtistProfile,
  getArtistExhibition,
}