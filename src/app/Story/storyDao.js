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
async function getStoryDetail(connection, storyIdx, userIdx){
  const query = `
  SELECT S.storyIdx,
        S.title,
        S.userIdx,
        U.nickname                                                                          as userName,
        U.imageUrl                                                                          as userProfile,
        S.content,
        DATE_FORMAT(S.createdAt, '%Y.%m.%d.')                                               as createdAt,
        (SELECT COUNT(*) FROM StoryLike SL WHERE SL.storyIdx = ${storyIdx})                 as totalLikeCnt,
        (SELECT COUNT(storyCommentIdx)
          FROM StoryComment SC
          WHERE SC.storyIdx = ${storyIdx} && SC.isDeleted = 'N')                             as totalCommentCnt,
        IF(S.userIdx = ${userIdx}, 'Y', 'N')                                                as isUserStory,
        IF(${userIdx} = -1, 'N',
            IF(EXISTS(SELECT *
                      FROM StoryLike SL
                      WHERE SL.userIdx = ${userIdx} && SL.storyIdx = S.storyIdx), 'Y', 'N')) as isLike
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
  SELECT imageUrl
  FROM StoryImage
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.imageUrl);
}

//storyIdx의 태그
async function getStoryTag(connection, storyIdx){
  const query = `
  SELECT tag FROM StoryTag
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.tag);
}

//스토리 기본 정보 등록
async function createStoryInfo(connection, userIdx, title, content){
  const query = `
  INSERT INTO Story(userIdx, title, content)
  VALUES (${userIdx}, ?, ?);
  `;
  const [rows] = await connection.query(query, [title, content]);
  return rows;
}

//스토리 태그 등록
async function createStoryTag(connection, storyIdx, tag){
  const query = `
  INSERT INTO StoryTag(storyIdx, tag)
  VALUES (${storyIdx}, ?);
  `;
  const [rows] = await connection.query(query, [tag]);
  return rows;
}

//스토리 이미지 등록
async function createStoryImage(connection, storyIdx, imageUrl){
  const query = `
  INSERT INTO StoryImage(storyIdx, imageUrl)
  VALUES (${storyIdx}, ?);
  `;
  const [rows] = await connection.query(query, [imageUrl]);
  return rows;
}

//스토리의 userIdx 가져오기
async function getStoryUserIdx(connection, storyIdx){
  const query = `
  SELECT userIdx FROM Story
  WHERE storyIdx = ${storyIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['userIdx'];
}

//스토리 삭제
async function deleteStory(connection, storyIdx){
  const query = `
  UPDATE Story
  SET isDeleted = 'Y'
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 기본 정보 수정하기
async function updateStoryInfo(connection, storyIdx, title, content){
  const query = `
  UPDATE Story
  SET title = IFNULL(?, title),
      content = IFNULL(?, content)
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query, [title, content]);
  return rows;
}

//스토리 태그 삭제
async function deleteStoryTag(connection, storyIdx){
  const query = `
  DELETE FROM StoryTag
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 사진 삭제
async function deleteStoryImage(connection, storyIdx){
  const query = `
  DELETE FROM StoryImage
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 좋아요 삭제
async function deleteStoryLike(connection, storyIdx){
  const query = `
  DELETE
  FROM StoryLike
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 댓글 삭제
async function deleteStoryComment(connection, storyIdx){
  const query = `
  UPDATE StoryComment
  SET isDeleted = 'Y'
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//기존에 신고한 스토리인지
async function isAlreadyReportedStory(connection, userIdx, storyIdx, withTypeIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReqReportedWith
    WHERE withTypeIdx = ${withTypeIdx} && userIdx = ${userIdx} && withIdx = ${storyIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//자기 스토리인지
async function isUserStory(connection, userIdx, storyIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM Story
    WHERE userIdx = ${userIdx} && storyIdx = ${storyIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//스토리 신고
async function reportStory(connection, userIdx, storyIdx, withTypeIdx, reportedReasonIdx, etcReason){
  const query = `
  INSERT INTO ReqReportedWith (withTypeIdx, withIdx, userIdx, reportedReasonIdx, etcReason)
  VALUES (${withTypeIdx}, ${storyIdx}, ${userIdx}, ${reportedReasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
}

//유저의 스토리 전체 삭제
async function deleteUserStory(connection, userIdx){
  const query = `
  UPDATE Story
  SET isDeleted = 'Y'
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isExistStoryIdx,
  getStoryDetail,
  getStoryImage,
  getStoryTag,
  createStoryInfo,
  createStoryTag,
  createStoryImage,
  getStoryUserIdx,
  deleteStory,
  updateStoryInfo,
  deleteStoryTag,
  deleteStoryImage,
  deleteStoryLike,
  deleteStoryComment,
  isAlreadyReportedStory,
  isUserStory,
  reportStory,
  deleteUserStory,
}