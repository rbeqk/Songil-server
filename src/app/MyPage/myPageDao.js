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

module.exports = {
  getTotalWrittenCommentCnt,
  getWrittenComment,
}