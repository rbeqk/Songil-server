//존재하는 storyCommentIdx인지
async function isExistStoryCommentParentIdx(connection, parentIdx){
  const query = `
  SELECT EXISTS(SELECT storyCommentIdx
    FROM StoryComment
    WHERE storyCommentIdx = ${parentIdx} && parentIdx IS NULL) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//story 댓글 작성
async function createStoryComment(connection, storyIdx, userIdx, parentIdx, content){
  const query = `
  INSERT INTO StoryComment(storyIdx, userIdx, parentIdx, comment)
  VALUES (${storyIdx}, ${userIdx}, ${parentIdx}, ?);
  `;
  const [rows] = await connection.query(query, [content]);
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

//스토리 부모 댓글 가져오기
async function getStoryParentComment(connection, storyIdx, userIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT SC.storyCommentIdx as commentIdx,
          SC.userIdx,
          U.imageUrl         as userProfile,
          U.nickname         as userName,
          IF(S.userIdx = SC.userIdx, 'Y', 'N') as isWriter,
          SC.comment,
          CASE
            WHEN TIMESTAMPDIFF(minute, SC.createdAt, NOW()) < 1
                THEN '방금 전'
            WHEN TIMESTAMPDIFF(hour, SC.createdAt, NOW()) < 1
                THEN CONCAT(TIMESTAMPDIFF(minute, SC.createdAt, NOW()), '분 전')
            WHEN TIMESTAMPDIFF(hour, SC.createdAt, NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(hour, SC.createdAt, NOW()), '시간 전')
            WHEN TIMESTAMPDIFF(day, DATE_FORMAT(SC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')) <= 3
                THEN CONCAT(TIMESTAMPDIFF(day, DATE_FORMAT(SC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')), '일 전')
            ELSE DATE_FORMAT(SC.createdAt, '%Y.%m.%d. %H:%i')
            END                                                     as createdAt,
          IF(SC.userIdx = ${userIdx}, 'Y', 'N') as isUserComment,
          SC.isDeleted,
          SC.isReported
    FROM StoryComment SC
            JOIN User U ON U.userIdx = SC.userIdx && U.isDeleted = 'N'
            JOIN Story S ON S.storyIdx = SC.storyIdx && S.isDeleted = 'N'
    WHERE SC.parentIdx IS NULL && SC.storyIdx = ${storyIdx}
    LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 대댓글 가져오기
async function getStoryReComment(connection, parentIdx, userIdx){
  const query = `
  SELECT SC.storyCommentIdx                    as commentIdx,
          SC.userIdx,
          U.imageUrl                            as userProfile,
          U.nickname                            as userName,
          IF(S.userIdx = SC.userIdx, 'Y', 'N')  as isWriter,
          SC.comment,
          CASE
            WHEN TIMESTAMPDIFF(minute, SC.createdAt, NOW()) < 1
                THEN '방금 전'
            WHEN TIMESTAMPDIFF(hour, SC.createdAt, NOW()) < 1
                THEN CONCAT(TIMESTAMPDIFF(minute, SC.createdAt, NOW()), '분 전')
            WHEN TIMESTAMPDIFF(hour, SC.createdAt, NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(hour, SC.createdAt, NOW()), '시간 전')
            WHEN TIMESTAMPDIFF(day, DATE_FORMAT(SC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')) <= 3
                THEN CONCAT(TIMESTAMPDIFF(day, DATE_FORMAT(SC.createdAt, '%Y-%m-%d'), DATE_FORMAT(NOW(),'%Y-%m-%d')), '일 전')
            ELSE DATE_FORMAT(SC.createdAt, '%Y.%m.%d. %H:%i')
            END                                                     as createdAt,
          IF(SC.userIdx = ${userIdx}, 'Y', 'N') as isUserComment,
          SC.isReported
    FROM StoryComment SC
            JOIN User U ON U.userIdx = SC.userIdx && U.isDeleted = 'N'
            JOIN Story S ON S.storyIdx = SC.storyIdx && S.isDeleted = 'N'
    WHERE SC.parentIdx IS NOT NULL && SC.isDeleted = 'N' && SC.parentIdx = ${parentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//스토리 댓글 신고
async function reportStoryComment(connection, storyCommentIdx, userIdx, reportedCommentReasonIdx, etcReason){
  const query = `
  INSERT INTO ReportedStoryComment(userIdx, storyCommentIdx, reportedCommentReasonIdx, etcContent)
  VALUES (${userIdx}, ${storyCommentIdx}, ${reportedCommentReasonIdx}, IFNULL(?, NULL));
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
}

//사용자가 기존에 신고한 스토리 댓글 idx인지
async function isExistUserReportedCommentIdx(connection, userIdx, storyCommentIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReportedStoryComment
    WHERE userIdx = ${userIdx} && storyCommentIdx = ${storyCommentIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//자기 댓글인지
async function isUserStoryComment(connection, userIdx, storyCommentIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM StoryComment
    WHERE storyCommentIdx = ${storyCommentIdx} && userIdx = ${userIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

module.exports = {
  createStoryComment,
  isExistStoryCommentParentIdx,
  isExistStoryCommentIdx,
  getStoryCommentUserIdx,
  deleteStoryComment,
  getStoryParentComment,
  getStoryReComment,
  reportStoryComment,
  isExistUserReportedCommentIdx,
  isUserStoryComment,
}