//작성한 코멘트 수
async function getTotalWrittenCommentCnt(connection, userIdx){
  const query = `
  SELECT COUNT(craftCommentIdx) as totalCnt FROM CraftComment
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//작성한 코멘트
async function getWrittenComment(connection, userIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT CC.craftCommentIdx                    as commentIdx,
        CC.craftIdx,
        A.artistIdx,
        U.nickname                            as artistName,
        CC.content,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') as createdAt
  FROM CraftComment CC
          JOIN Craft C ON C.craftIdx = CC.craftIdx
          JOIN Artist A ON C.artistIdx = A.artistIdx
          JOIN User U ON U.userIdx = A.userIdx
  WHERE CC.isDeleted = 'N' && CC.userIdx = ${userIdx}
  ORDER BY CC.craftCommentIdx
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작가 idx
async function getArtistIdx(connection, userIdx){
  const query = `
  SELECT artistIdx FROM Artist
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  
  return rows[0]?.artistIdx ? rows[0].artistIdx : -1;
}

//작성 WITH(Story, QnA, ABTest) 개수
async function getWrittenWithCnt(connection, userIdx, artistIdx){
  const storyQuery = `
  SELECT COUNT(storyIdx) as totalCnt
  FROM Story
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [storyRows] = await connection.query(storyQuery);

  const QnAQuery = `
  SELECT COUNT(qnaIdx) as totalCnt
  FROM QnA
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [QnARows] = await connection.query(QnAQuery);

  //작가일 경우
  if (artistIdx !== -1){
    //AB Test
    const ABTestQuery = `
    SELECT COUNT(abTestIdx) as totalCnt
    FROM ABTest
    WHERE artistIdx = ${artistIdx} && isDeleted = 'N';
    `;
    const [ABTestRows] = await connection.query(ABTestQuery);

    return storyRows[0]['totalCnt'] + QnARows[0]['totalCnt'] + ABTestRows[0]['totalCnt'];
  }
  //일반 유저일 경우
  else{
    return storyRows[0]['totalCnt'] + QnARows[0]['totalCnt'];
  }
}

module.exports = {
  getTotalWrittenCommentCnt,
  getWrittenComment,
  getArtistIdx,
  getWrittenWithCnt,
}