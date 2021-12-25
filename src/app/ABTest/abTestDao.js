//존재하는 abTestIdx인지
async function isExistABTestIdx(connection, abTestIdx){
  const query = `
  SELECT EXISTS(SELECT abTestIdx
    FROM ABTest
    WHERE abTestIdx = ${abTestIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//ABTest 정보
async function getABTestInfo(connection, abTestIdx){
  const query = `
  SELECT AB.abTestIdx,
    AB.artistIdx,
    U.imageUrl                                       as artistImageUrl,
    U.nickname                                       as artistName,
    AB.content,
    AB.imageA,
    AB.imageB,
    DATE_FORMAT(AB.deadline, '%Y.%m.%d')             as deadline,
    (SELECT COUNT(*) as totalCommentCnt
    FROM ABTestComment ABC
    WHERE ABC.abTestIdx = ${abTestIdx} && ABC.isDeleted = 'N') as totalCommentCnt,
    IF(TIMESTAMPDIFF(SECOND, NOW(), deadline) < 0, 'Y', 'N') as isFinished
  FROM ABTest AB
      JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
      JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE AB.abTestIdx = ${abTestIdx} && AB.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유저의 투표 정보 가져오기
async function getUserVote(connection, abTestIdx, userIdx){
  const query = `
  SELECT vote as voteImage FROM ABTestVote
  WHERE abTestIdx = ${abTestIdx} && userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//해당 ABTest 총 투표 수
async function getCurrentVoteTotalCnt(connection, abTestIdx){
  const query = `
  SELECT COUNT(*) as totalVoteCnt FROM ABTestVote
  WHERE abTestIdx = ${abTestIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalVoteCnt'];
}

//유저가 투표한 표의 총 투표 수
async function getCurrentUserVoteTotalCnt(connection, abTestIdx, userVote){
  const query = `
  SELECT COUNT(*) as totalVoteCnt FROM ABTestVote
  WHERE abTestIdx = ${abTestIdx} && vote = '${userVote}';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalVoteCnt'];
}

//투표 결과(투표 많은 순)
async function getFinalVoteInfo(connection, abTestIdx){
  const query = `
  SELECT vote as voteImage, COUNT(*) as totalCnt FROM ABTestVote
  WHERE abTestIdx = ${abTestIdx}
  GROUP BY vote
  ORDER BY totalCnt DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//더 빨리 퍼센트에 도달된 이미지(=마지막 표가 아닌 것)
async function getEarlyArrivedImage(connection, abTestIdx){
  const query = `
  SELECT IF(vote = 'A', 'B', 'A') as earlyArrivedImage FROM ABTestVote
  WHERE abTestIdx = ${abTestIdx}
  ORDER BY createdAt DESC
  LIMIT 1;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['earlyArrivedImage'];
}

//작가의 userIdx인지
async function isArtistUserIdx(connection, userIdx){
  const query = `
  SELECT EXISTS(SELECT artistIdx
              FROM Artist
              WHERE userIdx = ${userIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//작가 idx
async function getArtistIdx(connection, userIdx){
  const query = `
  SELECT artistIdx
  FROM Artist
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['artistIdx'];
}

async function createABTest(connection, content, deadline, imageArr, artistIdx){
  const query = `
  INSERT INTO ABTest(artistIdx, content, imageA, imageB, deadline)
  VALUES (${artistIdx}, '${content}', '${imageArr[0]}', '${imageArr[1]}', '${deadline}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistABTestIdx,
  getABTestInfo,
  getUserVote,
  getCurrentVoteTotalCnt,
  getCurrentUserVoteTotalCnt,
  getFinalVoteInfo,
  getEarlyArrivedImage,
  isArtistUserIdx,
  getArtistIdx,
  createABTest,
}