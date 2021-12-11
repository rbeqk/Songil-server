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

module.exports = {
  isExistStoryIdx,
  getStoryDetail,
  getStoryImage,
  getUserStoryLike
}