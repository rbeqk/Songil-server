//존재하는 storyCommentIdx인지
async function isExistStoryCommentParentIdx(connection, parentIdx){
  const query = `
  SELECT EXISTS(SELECT storyCommentIdx
    FROM StoryComment
    WHERE storyCommentIdx = ${parentIdx} && isDeleted = 'N' && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
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

//존재하는 스토리 댓글 idx인지
async function isExistStoryCommentIdx(connection, storyCommentIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM StoryComment
    WHERE storyCommentIdx = ${storyCommentIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//스토리 댓글의 userIdx 가져오기
async function getStoryCommentUserIdx(connection, storyCommentIdx){
  const query = `
  SELECT userIdx FROM StoryComment
  WHERE storyCommentIdx = ${storyCommentIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//스토리 댓글 삭제
async function deleteStoryComment(connection, storyCommentIdx){
  const query = `
  UPDATE StoryComment
  SET isDeleted = 'Y'
  WHERE storyCommentIdx = ${storyCommentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  createStoryComment,
  isExistStoryCommentParentIdx,
  isExistStoryCommentIdx,
  getStoryCommentUserIdx,
  deleteStoryComment,
}