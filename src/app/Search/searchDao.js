//사용자 별 최근 검색어 가져오기(15개)
async function getRecentlySearch(connection, userIdx){
  const query = `
  SELECT S.searchIdx, S.word
  FROM UserSearch US
          JOIN Search S ON S.searchIdx = US.searchIdx
  WHERE US.userIdx = ${userIdx} && US.isDeleted = 'N'
  ORDER BY US.updatedAt DESC
  LIMIT 15
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//인기 검색어 가져오기(10개)
async function getPopularSearch(connection){
  const query = `
  SELECT searchIdx, word FROM Search
  ORDER BY count DESC
  LIMIT 10
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//word의 searchIdx가져오기
async function getSearchIdx(connection, word){
  const query = `
  SELECT searchIdx FROM Search
  WHERE word = '${word}';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유효한 user의 search 항목인지
async function isExistUserSearchIdx(connection, userIdx, searchIdx){
  const query = `
  SELECT EXISTS(SELECT userSearchIdx
    FROM UserSearch
    WHERE userIdx = ${userIdx} && searchIdx = ${searchIdx} && isDeleted = 'N') as isExist
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//사용자 최근검색어 삭제
async function deleteUserRecentlySearch(connection, userIdx, searchIdx){
  const query = `
  UPDATE UserSearch
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx} && searchIdx = ${searchIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//user의 지울 검색어가 있는지
async function isExistUserSearchs(connection, userIdx){
  const query = `
  SELECT EXISTS(SELECT userSearchIdx
    FROM UserSearch
    WHERE userIdx = ${userIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//user의 최근검색어 전체 삭제
async function deleteAllUserRecentlySearch(connection, userIdx){
  const query = `
  UPDATE UserSearch
  SET isDeleted = 'Y'
  WHERE isDeleted = 'N' && userIdx = ${userIdx};
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
          JOIN Artist A ON A.artistIdx = C.artistIdx
          JOIN User U ON U.userIdx = A.userIdx
  WHERE C.name LIKE CONCAT('%', ?, '%') || U.nickname LIKE CONCAT('%', ?, '%')
            || C.content LIKE CONCAT('%', ?, '%') || CC.name LIKE CONCAT('%', ?, '%');
  `;
  const [rows] = await connection.query(query, [keyword, keyword, keyword]);
  return rows.map(item => item.craftIdx); 
}

module.exports = {
  getRecentlySearch,
  getPopularSearch,
  getSearchIdx,
  isExistUserSearchIdx,
  deleteUserRecentlySearch,
  isExistUserSearchs,
  deleteAllUserRecentlySearch,
  getCraftCorrespondToBasic,
}