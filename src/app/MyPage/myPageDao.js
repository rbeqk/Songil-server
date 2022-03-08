const {CATEGORY, ORDER_STATUS} = require('../../../modules/constants');

//작성 가능한 코멘트
async function getAvailableComment(connection, userIdx, startItemIdx, itemsPerPage){
  const query = `
  SELECT OC.orderCraftIdx AS orderDetailIdx,
        OC.craftIdx,
        C.name,
        C.mainImageUrl,
        C.artistIdx,
        U.nickname       AS artistName
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx && O.isPaid = 'Y'
          JOIN Craft C ON C.craftIdx = OC.craftIdx
          JOIN Artist A ON A.artistIdx = C.artistIdx
          JOIN User U ON U.userIdx = A.userIdx
  WHERE OC.orderCraftIdx NOT IN (SELECT CC.orderCraftIdx
                                FROM CraftComment CC
                                WHERE CC.isDeleted = 'N') && O.userIdx = ${userIdx} &&
        OC.orderStatusIdx = ${ORDER_STATUS.DELIVERY_COMPLETED}
  ORDER BY OC.orderCraftIdx DESC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작성한 코멘트
async function getWrittenComment(connection, userIdx, startItemIdx, itemsPerPage){
  const query = `
  SELECT CC.craftCommentIdx AS commentIdx,
        OC.craftIdx,
        C.name,
        C.artistIdx,
        U.nickname         AS artistName,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') AS createdAt,
        CC.content
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
          JOIN Artist A ON A.artistIdx = C.artistIdx
          JOIN User U ON U.userIdx = A.userIdx
  WHERE O.userIdx = ${userIdx} && CC.isDeleted = 'N'
  ORDER BY commentIdx DESC
  LIMIT ${startItemIdx}, ${itemsPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//작가 idx
async function getArtistIdx(connection, userIdx){
  const query = `
  SELECT artistIdx FROM Artist
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  
  return rows[0]?.artistIdx ? rows[0].artistIdx : -1;
}

//내가 쓴 글
async function getUserWrittenWith(connection, userIdx, artistIdx, startItemIdx, itemPerPage){
  //일반 사용자인 경우 -> Story && QnA
  if (artistIdx === -1){
    const userQuery = `
    SELECT S.storyIdx                                                                        as idx,
          1                                                                                 as categoryIdx,
          S.title,
          S.content,
          (SELECT imageUrl
            FROM StoryImage SI
            WHERE SI.storyIdx = S.storyIdx
            LIMIT 1)                                                                         as mainImageUrl,
          U.nickname                                                                        as name,
          DATE_FORMAT(S.createdAt, '%Y.%m.%d. %H:%i')                                       as createdAt,
          S.createdAt                                                                       as originalCreatedAt,
          (SELECT COUNT(*)
            FROM StoryLike SL
            WHERE SL.storyIdx = S.storyIdx)                                                  as totalLikeCnt,
          IF(EXISTS(SELECT *
                    FROM StoryLike SL2
                    WHERE SL2.userIdx = ${userIdx} && SL2.storyIdx = S.storyIdx), 'Y', 'N') as isLike,
          (SELECT COUNT(*)
            FROM StoryComment SC
            WHERE SC.storyIdx = S.storyIdx && SC.isDeleted = 'N')                            as totalCommentCnt
    FROM Story S
            JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
    WHERE S.isDeleted = 'N' && S.userIdx = ${userIdx}
    UNION
    SELECT Q.qnaIdx                                                                      as idx,
          2                                                                             as categoryIdx,
          Q.title,
          Q.content,
          NULL                                                                          as mainImageUrl,
          U.nickname                                                                    as name,
          DATE_FORMAT(Q.createdAt, '%Y.%m.%d. %H:%i')                                   as createdAt,
          Q.createdAt                                                                   as originalCreatedAt,
          (SELECT COUNT(*)
            FROM QnALike QL
            WHERE QL.qnaIdx = Q.qnaIdx)                                                  as totalLikeCnt,
          IF(EXISTS(SELECT *
                    FROM QnALike QL2
                    WHERE QL2.qnaIdx = Q.qnaIdx && QL2.userIdx = ${userIdx}), 'Y', 'N') as isLike,
          (SELECT COUNT(*)
            FROM QnAComment QC
            WHERE QC.qnaIdx = Q.qnaIdx && QC.isDeleted = 'N')                            as totalCommentCnt
    FROM QnA Q
            JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
    WHERE Q.isDeleted = 'N' && Q.userIdx = ${userIdx}
    ORDER BY originalCreatedAt DESC
    LIMIT ${startItemIdx}, ${itemPerPage};
    `;

    const [userRows] = await connection.query(userQuery);
    return userRows;
  }
  //작가인 경우 -> Story && QnA && ABTest
  else{
    const artistQuery = `
    SELECT S.storyIdx                                                                        as idx,
          1                                                                                 as categoryIdx,
          S.title,
          S.content,
          (SELECT imageUrl
            FROM StoryImage SI
            WHERE SI.storyIdx = S.storyIdx
            LIMIT 1)                                                                         as mainImageUrl,
          U.nickname                                                                        as name,
          DATE_FORMAT(S.createdAt, '%Y.%m.%d. %H:%i')                                       as createdAt,
          S.createdAt                                                                       as originalCreatedAt,
          (SELECT COUNT(*)
            FROM StoryLike SL
            WHERE SL.storyIdx = S.storyIdx)                                                  as totalLikeCnt,
          IF(EXISTS(SELECT *
                    FROM StoryLike SL2
                    WHERE SL2.userIdx = ${userIdx} && SL2.storyIdx = S.storyIdx), 'Y', 'N') as isLike,
          (SELECT COUNT(*)
            FROM StoryComment SC
            WHERE SC.storyIdx = S.storyIdx && SC.isDeleted = 'N')                            as totalCommentCnt
    FROM Story S
            JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
    WHERE S.isDeleted = 'N' && S.userIdx = ${userIdx}
    UNION
    SELECT Q.qnaIdx                                                                      as idx,
          2                                                                             as categoryIdx,
          Q.title,
          Q.content,
          NULL                                                                          as mainImageUrl,
          U.nickname                                                                    as name,
          DATE_FORMAT(Q.createdAt, '%Y.%m.%d. %H:%i')                                   as createdAt,
          Q.createdAt                                                                   as originalCreatedAt,
          (SELECT COUNT(*)
            FROM QnALike QL
            WHERE QL.qnaIdx = Q.qnaIdx)                                                  as totalLikeCnt,
          IF(EXISTS(SELECT *
                    FROM QnALike QL2
                    WHERE QL2.qnaIdx = Q.qnaIdx && QL2.userIdx = ${userIdx}), 'Y', 'N') as isLike,
          (SELECT COUNT(*)
            FROM QnAComment QC
            WHERE QC.qnaIdx = Q.qnaIdx && QC.isDeleted = 'N')                            as totalCommentCnt
    FROM QnA Q
            JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
    WHERE Q.isDeleted = 'N' && Q.userIdx = ${userIdx}
    UNION
    SELECT AB.abTestIdx                                                as idx,
          3                                                           as categoryIdx,
          NULL                                                        as title,
          AB.content,
          NULL                                                        as mainImageUrl,
          U.nickname                                                  as name,
          DATE_FORMAT(AB.createdAt, '%Y.%m.%d. %H:%i')                as createdAt,
          AB.createdAt                                                as originalCreatedAt,
          NULL                                                        as totalLikeCnt,
          NULL                                                        as isLike,
          (SELECT COUNT(*)
            FROM ABTestComment ABC
            WHERE ABC.isDeleted = 'N' && ABC.abTestIdx = AB.abTestIdx) as totalCommentCnt
    FROM ABTest AB
            JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
            JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
    WHERE AB.isDeleted = 'N' && AB.artistIdx = ${artistIdx}
    ORDER BY originalCreatedAt DESC
    LIMIT ${startItemIdx}, ${itemPerPage};
    `;

    const [artistRows] = await connection.query(artistQuery);
    return artistRows;
  }
}

//댓글 단 글 조회
async function getUserWrittenWithComment(connection, userIdx, startItemIdx, itemPerPage){
  const query = `
  SELECT *
  FROM (
          SELECT SC.storyIdx                                                                       as idx,
                  ${CATEGORY.STORY}                                                                 as categoryIdx,
                  (SELECT imageUrl
                  FROM StoryImage SI
                  WHERE SI.storyIdx = S.storyIdx
                  LIMIT 1)                                                                         as mainImageUrl,
                  S.title,
                  S.content,
                  U.nickname                                                                        as name,
                  DATE_FORMAT(S.createdAt, '%Y.%m.%d. %H:%i')                                       as createdAt,
                  SC.originalCreatedAt,
                  (SELECT COUNT(*)
                  FROM StoryLike SL
                  WHERE SL.storyIdx = S.storyIdx)                                                  as totalLikeCnt,
                  IF(EXISTS(SELECT *
                            FROM StoryLike SL
                            WHERE SL.userIdx = ${userIdx} && SL.storyIdx = S.storyIdx), 'Y', 'N')   as isLike,
                  (SELECT COUNT(*)
                  FROM StoryComment SC
                  WHERE SC.userIdx = ${userIdx} && SC.storyIdx = S.storyIdx && SC.isDeleted = 'N') as totalCommentCnt
          FROM (
                    SELECT storyIdx, createdAt as originalCreatedAt
                    FROM StoryComment
                    WHERE userIdx = ${userIdx} && isDeleted = 'N'
                    ORDER BY originalCreatedAt DESC
                    LIMIT 18446744073709551615
                ) SC
                    JOIN Story S ON S.storyIdx = SC.storyIdx && S.isDeleted = 'N'
                    JOIN User U ON U.userIdx = S.userIdx && U.isDeleted = 'N'
          GROUP BY SC.storyIdx
          UNION ALL
          SELECT QC.qnaIdx                                                                    as idx,
                  ${CATEGORY.QNA}                                                              as categoryIdx,
                  NULL                                                                         as mainImageUrl,
                  Q.title,
                  Q.content,
                  U.nickname                                                                   as name,
                  DATE_FORMAT(Q.createdAt, '%Y.%m.%d. %H:%i')                                  as createdAt,
                  QC.originalCreatedAt,
                  (SELECT COUNT(*)
                  FROM QnALike QL
                  WHERE QL.qnaIdx = QC.qnaIdx)                                                as totalLikeCnt,
                  IF(EXISTS(SELECT *
                            FROM QnALike QL
                            WHERE QL.userIdx = ${userIdx} && QL.qnaIdx = QC.qnaIdx), 'Y', 'N') as isLike,
                  (SELECT COUNT(*)
                  FROM QnAComment QC2
                  WHERE QC2.qnaIdx = QC.qnaIdx && QC2.isDeleted = 'N')                        as totalCommentCnt
          FROM (
                    SELECT qnaIdx, createdAt as originalCreatedAt
                    FROM QnAComment
                    WHERE isDeleted = 'N' && userIdx = ${userIdx}
                    ORDER BY originalCreatedAt DESC
                    LIMIT 18446744073709551615
                ) QC
                    JOIN QnA Q ON Q.qnaIdx = QC.qnaIdx && Q.isDeleted = 'N'
                    JOIN User U ON U.userIdx = Q.userIdx && U.isDeleted = 'N'
          GROUP BY QC.qnaIdx
          UNION ALL
          SELECT ABC.abTestIdx                                                  as idx,
                  ${CATEGORY.ABTEST}                                             as categoryIdx,
                  NULL                                                           as mainImageUrl,
                  NULL                                                           as title,
                  AB.content,
                  U.nickname                                                     as name,
                  DATE_FORMAT(AB.createdAt, '%Y.%m.%d. %H:%i')                   as createdAt,
                  ABC.originalCreatedAt,
                  NULL                                                           as totalLikeCnt,
                  NULL                                                           as isLike,
                  (SELECT COUNT(*)
                  FROM ABTestComment ABC2
                  WHERE ABC2.abTestIdx = ABC.abTestIdx && ABC2.isDeleted = 'N') as totalCommentCnt
          FROM (
                    SELECT abTestIdx, createdAt as originalCreatedAt
                    FROM ABTestComment
                    WHERE userIdx = ${userIdx} && isDeleted = 'N'
                    ORDER BY originalCreatedAt DESC
                    LIMIT 18446744073709551615
                ) ABC
                    JOIN ABTest AB ON AB.abTestIdx = ABC.abTestIdx && AB.isDeleted = 'N'
                    JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                    JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
          GROUP BY ABC.abTestIdx
      ) R
  ORDER BY R.originalCreatedAt DESC
  LIMIT ${startItemIdx}, ${itemPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//기존에 존재하는 닉네임인지(자기 자신 제외)
async function isExistNickname(connection, userIdx, userName){
  const query = `
  SELECT EXISTS(SELECT * FROM User WHERE nickname = ? && userIdx != ${userIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query, [userName]);
  return rows[0]['isExist'];
}

//유저 프로필 수정
async function updateUserProfile(connection, userIdx, setDefault, userName, userProfile){
  
  //프로필 사진 기본으로 변경 시
  if (setDefault){
    const query = `
    UPDATE User
    SET nickname = IFNULL(?, nickname),
        imageUrl = NULL
    WHERE userIdx = ${userIdx};
    `;
    const [rows] = await connection.query(query, [userName]);
    return rows;
  }
  else{
    const query = `
    UPDATE User
    SET nickname = IFNULL(?, nickname),
        imageUrl = IFNULL(?, imageUrl)
    WHERE userIdx = ${userIdx};
    `;
    const [rows] = await connection.query(query, [userName, userProfile]);
    return rows;
  }
}

//유저 기본 정보 가져오기
async function getMyBasicInfo(connection, userIdx){
  const query = `
  SELECT nickname AS userName, imageUrl AS userProfile, point
  FROM User
  WHERE userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유저 베네핏 개수 가져오기
async function getUserBenefitCnt(connection, userIdx){
  const query = `
  SELECT COUNT(UB.benefitIdx) AS totalCnt
  FROM UserBenefit UB
          JOIN Benefit B ON B.benefitIdx = UB.benefitIdx && B.isDeleted = 'N' && deadline > NOW()
  WHERE UB.userIdx = ${userIdx} && UB.isUsed = 'N' && UB.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//유저 찜한 상품 개수 가져오기
async function getUserLikedCraftCnt(connection, userIdx){
  const query = `
  SELECT COUNT(craftIdx) AS totalCnt
  FROM CraftLike
  WHERE userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//유저 주문현황 개수 가져오기
async function getUserOrderCnt(connection, userIdx){
  const query = `
  SELECT COUNT(orderIdx) AS totalCnt FROM OrderT
  WHERE userIdx = ${userIdx} && isPaid = 'Y';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//유저 내 코멘트(=상품 댓글) 개수 가져오기
async function getUserCommentCnt(connection, userIdx){
  const query = `
  SELECT COUNT(CC.craftCommentIdx) AS totalCnt
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
  WHERE CC.isDeleted = 'N' && O.userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//유저의 1:1 문의 개수 가져오기
async function getUserAskCnt(connection, userIdx){
  const query = `
  SELECT COUNT(askIdx) AS totalCnt
  FROM Ask
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

module.exports = {
  getAvailableComment,
  getWrittenComment,
  getArtistIdx,
  getUserWrittenWith,
  getUserWrittenWithComment,
  isExistNickname,
  updateUserProfile,
  getMyBasicInfo,
  getUserBenefitCnt,
  getUserLikedCraftCnt,
  getUserOrderCnt,
  getUserCommentCnt,
  getUserAskCnt,
}