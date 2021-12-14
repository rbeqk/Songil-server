//존재하는 parentIdx인지
async function isExistABTestCommentParentIdx(connection, parentIdx){
  const query = `
  SELECT EXISTS(SELECT abTestCommentIdx
    FROM ABTestComment
    WHERE abTestCommentIdx = ${parentIdx} && isDeleted = 'N' && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//abTest 댓글 작성
async function createABTestComment(connection, abTestIdx, userIdx, parentIdx, comment){
  const query = `
  INSERT INTO ABTestComment(abTestIdx, userIdx, parentIdx, comment)
  VALUES (${abTestIdx}, ${userIdx}, ${parentIdx}, '${comment}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistABTestCommentParentIdx,
  createABTestComment,
}