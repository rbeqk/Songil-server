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

//storyIdx의 태그
async function getStoryTag(connection, storyIdx){
  const query = `
  SELECT tag FROM StoryTag
  WHERE storyIdx = ${storyIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 기본 정보 등록
async function createStoryInfo(connection, userIdx, title, content){
  const query = `
  INSERT INTO Story(userIdx, title, content)
  VALUES (${userIdx}, '${title}', '${content}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 태그 등록
async function createStoryTag(connection, storyIdx, tag){
  const query = `
  INSERT INTO StoryTag(storyIdx, tag)
  VALUES (${storyIdx}, '${tag}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 이미지 등록
async function createStoryImage(connection, storyIdx, imageUrl){
  const query = `
  INSERT INTO StoryImage(storyIdx, imageUrl)
  VALUES (${storyIdx}, '${imageUrl}');
  `;
  const [rows] = await connection.query(query);
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
  WHERE storyIdx = ?;
  `;
  const [rows] = await connection.query(query, [title, content, storyIdx]);
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
  UPDATE StoryImage
  SET isDeleted = 'Y'
  WHERE storyIdx = ${storyIdx};
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
}