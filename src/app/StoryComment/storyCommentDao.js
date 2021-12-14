//총 story Parent댓글 개수(존재하는 Parent댓글 개수 + 삭제된 Parent댓글이지만 Re댓글이 존재하는 댓글 개수)
async function getStoryParentCommentCnt(connection, storyIdx){
  //존재하는 Parent댓글 개수
  let query = `
  SELECT COUNT(storyCommentIdx) as totalExistParentComment
  FROM StoryComment
  WHERE storyIdx = ${storyIdx} && isDeleted = 'N' && parentIdx IS NULL;
  `;
  const [existParentCnt] = await connection.query(query);
  
  //삭제된 Parent댓글이지만 Re댓글이 존재하는 댓글 개수
  query = `
  SELECT COUNT(SC1.storyCommentIdx) as totalDeletedParentComment
  FROM StoryComment SC1
  WHERE SC1.storyIdx = ${storyIdx} && SC1.isDeleted = 'Y' && SC1.parentIdx IS NULL &&
        SC1.storyCommentIdx IN (SELECT SC2.parentIdx
                                FROM StoryComment SC2
                                WHERE SC2.storyIdx = ${storyIdx} && SC2.isDeleted = 'N' && SC2.parentIdx IS NOT NULL);
  `;
  const [deletedParentCnt] = await connection.query(query);

  return existParentCnt[0]['totalExistParentComment'] + deletedParentCnt[0]['totalDeletedParentComment'];
}

//총 story Re댓글 개수
async function getStoryReCommentCnt(connection, storyIdx){
  const query = `
  SELECT COUNT(storyCommentIdx) as totalReCommentCnt FROM StoryComment
  WHERE storyIdx = ${storyIdx} && isDeleted = 'N' && parentIdx IS NOT NULL;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalReCommentCnt'];
}

//story 댓글 작성
async function createStoryComment(connection, storyIdx, userIdx, parentIdx, content){
  const query = `
  INSERT INTO StoryComment(storyIdx, userIdx, parentIdx, comment)
  VALUES (${storyIdx}, ${userIdx}, ${parentIdx}, '${content}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getStoryParentCommentCnt,
  getStoryReCommentCnt,
  createStoryComment,
}