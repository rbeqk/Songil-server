//존재하는 stroyIdx인지
async function isExistStoryIdx(connection, storyIdx){
  const query = `
  SELECT EXISTS(SELECT storyIdx
    FROM Story
    WHERE storyIdx = ${storyIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//stroyIdx의 정보
async function getStoryDetail(connection, storyIdx){
  const query = `
  SELECT S.storyIdx,
        S.title,
        S.userIdx,
        U.nickname                                                          as userName,
        U.imageUrl                                                          as userProfile,
        S.content,
        DATE_FORMAT(S.createdAt, '%Y.%m.%d.')                               as createdAt,
        (SELECT COUNT(*) FROM StoryLike SL WHERE SL.storyIdx = ${storyIdx}) as totalLikeCnt,
        (SELECT COUNT(storyCommentIdx)
          FROM StoryComment SC
          WHERE SC.storyIdx = ${storyIdx} && SC.isDeleted = 'N')             as totalCommentCnt
  FROM Story S
          JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
  WHERE S.storyIdx = ${storyIdx} && S.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//storyIdx의 이미지
async function getStoryImage(connection, storyIdx){
  const query = `
  SELECT * FROM StoryImage
  WHERE storyIdx = ${storyIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//유저 story 좋아요 여부
async function getUserStoryLike(connection, storyIdx, userIdx){
  const query = `
  SELECT EXISTS(SELECT * FROM StoryLike WHERE storyIdx = ${storyIdx} && userIdx = ${userIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//현재 user의 story 좋아요 여부 가져오기
async function getCurrentUserStoryLikeStatus(connection, userIdx, storyIdx){
  const query = `
  SELECT IF(EXISTS(SELECT *
    FROM StoryLike
    WHERE userIdx = ${userIdx} && storyIdx = ${storyIdx}) = 1, 'Y', 'N') as isLike;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isLike'];
}

//story 좋아요 삭제
async function deleteUserStoryLike(connection, userIdx, storyIdx){
  const query = `
  DELETE FROM StoryLike
  WHERE userIdx = ${userIdx} && storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//story 좋아요 입력
async function createUserStoryLike(connection, userIdx, storyIdx){
  const query = `
  INSERT INTO StoryLike(userIdx, storyIdx)
  VALUES (${userIdx}, ${storyIdx});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//story의 총 좋아요 개수 가져오기
async function getTotalStoryLikeCnt(connection, storyIdx){
  const query = `
  SELECT COUNT(*) as totalLikeCnt FROM StoryLike
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalLikeCnt'];
}

module.exports = {
  isExistStoryIdx,
  getStoryDetail,
  getStoryImage,
  getUserStoryLike,
  getCurrentUserStoryLikeStatus,
  deleteUserStoryLike,
  createUserStoryLike,
  getTotalStoryLikeCnt,
}