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

//존재하는 abTest 댓글 idx인지
async function isExistABTestCommentIdx(connection, abTestCommentIdx){
  const query = `
  SELECT EXISTS(SELECT abTestCommentIdx
    FROM ABTestComment
    WHERE abTestCommentIdx = ${abTestCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//abTest 댓글의 userIdx 가져오기
async function getABTestommentUserIdx(connection, abTestCommentIdx){
  const query = `
  SELECT userIdx FROM ABTestComment
  WHERE abTestCommentIdx = ${abTestCommentIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//abTest 댓글 삭제
async function deleteABTestomment(connection, abTestCommentIdx){
  const query = `
  UPDATE ABTestComment
  SET isDeleted = 'Y'
  WHERE abTestCommentIdx = ${abTestCommentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistABTestCommentParentIdx,
  createABTestComment,
  isExistABTestCommentIdx,
  getABTestommentUserIdx,
  deleteABTestomment,
}