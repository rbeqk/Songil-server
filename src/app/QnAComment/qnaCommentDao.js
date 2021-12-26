//존재하는 parentIdx인지
async function isExistQnACommentParentIdx(connection, parentIdx){
  const query = `
  SELECT EXISTS(SELECT qnaCommentIdx
    FROM QnAComment
    WHERE qnaCommentIdx = ${parentIdx} && isDeleted = 'N' && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//qna 댓글 작성
async function createQnAComment(connection, qnaIdx, userIdx, parentIdx, comment){
  const query = `
  INSERT INTO QnAComment(qnaIdx, userIdx, parentIdx, comment)
  VALUES (${qnaIdx}, ${userIdx}, ${parentIdx}, '${comment}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//존재하는 QnA 댓글 idx인지
async function isExistSQnACommentIdx(connection, qnaCommentIdx){
  const query = `
  SELECT EXISTS(SELECT qnaCommentIdx
    FROM QnAComment
    WHERE qnaCommentIdx = ${qnaCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//QnA 댓글의 userIdx 가져오기
async function getQnACommentUserIdx(connection, qnaCommentIdx){
  const query = `
  SELECT userIdx FROM QnAComment
  WHERE qnaCommentIdx = ${qnaCommentIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//QnA 댓글 삭제
async function deleteStoryComment(connection, qnaCommentIdx){
  const query = `
  UPDATE QnAComment
  SET isDeleted = 'Y'
  WHERE qnaCommentIdx = ${qnaCommentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistQnACommentParentIdx,
  createQnAComment,
  isExistSQnACommentIdx,
  getQnACommentUserIdx,
  deleteStoryComment,
}