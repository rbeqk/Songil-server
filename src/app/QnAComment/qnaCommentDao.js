//존재하는 qnaCommentIdx인지
async function isExistQnACommentIdx(connection, parentIdx){
  const query = `
  SELECT EXISTS(SELECT qnaCommentIdx
    FROM QnAComment
    WHERE qnaCommentIdx = ${parentIdx} && isDeleted = 'N') as isExist;
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

module.exports = {
  isExistQnACommentIdx,
  createQnAComment,
}