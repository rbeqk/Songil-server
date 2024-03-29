const {ORDER_STATUS} = require('../../../modules/constants');

//총 포토 댓글 개수
async function getOnlyPhotoCommentCnt(connection, craftIdx){
  const query = `
  SELECT COUNT(CC.craftCommentIdx) AS totalCnt
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
  WHERE CC.isDeleted = 'N' && CC.isPhotoComment = 'Y' && OC.craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//총 댓글 개수
async function getCommentCnt(connection, craftIdx){
  const query = `
  SELECT COUNT(CC.craftCommentIdx) AS totalCnt
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
  WHERE CC.isDeleted = 'N' && OC.craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//상품 포토 댓글 전체 가져오기
async function getCommentInfoOnlyPhoto(connection, craftIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT CC.craftCommentIdx                    AS commentIdx,
        U.userIdx,
        U.nickname,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') as createdAt,
        CC.content,
        CC.isReported
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN User U ON O.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE CC.isDeleted = 'N' && OC.craftIdx = ${craftIdx} && CC.isPhotoComment = 'Y'
  ORDER BY CC.craftCommentIdx
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 댓글 전체 가져오기
async function getCommentInfo(connection, craftIdx, startItemIdx, pageItemCnt){
  const query = `
  SELECT CC.craftCommentIdx                    AS commentIdx,
        U.userIdx,
        U.nickname,
        DATE_FORMAT(CC.createdAt, '%Y.%m.%d') as createdAt,
        CC.content,
        CC.isReported
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN User U ON O.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE CC.isDeleted = 'N' && OC.craftIdx = ${craftIdx}
  ORDER BY CC.craftCommentIdx
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//댓글 별 사진 가져오기
async function getCommentImageUrlArr(connection, commentIdx){
  const query = `
  SELECT imageUrl
  FROM CraftCommentImage
  WHERE craftCommentIdx = ${commentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows.map(item => item.imageUrl);
}

//존재하는 상품 댓글 idx인지
async function isExistCraftCommentIdx(connection, craftCommentIdx){
  const query = `
  SELECT EXISTS(SELECT craftCommentIdx
    FROM CraftComment
    WHERE isDeleted = 'N' && craftCommentIdx = ${craftCommentIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//사용자가 기존에 신고한 상품 댓글 idx인지
async function isAlreadyReportedCraftComment(connection, userIdx, craftCommentIdx, commentTypeIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM ReqReportedComment
    WHERE userIdx = ${userIdx} && commentIdx = ${craftCommentIdx} && commentTypeIdx = ${commentTypeIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//자기 댓글인지
async function isUserCraftComment(connection, userIdx, craftCommentIdx){
  const query = `
  SELECT EXISTS(SELECT CC.craftCommentIdx
    FROM CraftComment CC
            JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
            JOIN OrderT O ON O.orderIdx = OC.orderIdx
    WHERE CC.craftCommentIdx = ${craftCommentIdx} && O.userIdx = ${userIdx} &&
          CC.isDeleted = 'N') AS isExists;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExists'];
}

//댓글 신고
async function reportCraftComment(connection, userIdx, craftCommentIdx, reportedReasonIdx, etcReason, commentTypeIdx){
  const query = `
  INSERT INTO ReqReportedComment(commentTypeIdx, commentIdx, userIdx, reportedReasonIdx, etcReason)
  VALUES (${commentTypeIdx}, ${craftCommentIdx}, ${userIdx}, ${reportedReasonIdx}, ?);
  `;
  const [rows] = await connection.query(query, [etcReason]);
  return rows;
}

//상품 댓글 내용 추가
async function createCraftComment(connection, orderCraftIdx, comment){
  const query = `
  INSERT INTO CraftComment (orderCraftIdx, content)
  VALUES (${orderCraftIdx}, ?);
  `;
  const [rows] = await connection.query(query, [comment]);
  return rows;
}

//포토 댓글로 변경
async function updatePhotoCraftComment(connection, craftCommentIdx){
  const query = `
  UPDATE CraftComment
  SET isPhotoComment = 'Y'
  WHERE craftCommentIdx = ${craftCommentIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 댓글 사진 추가
async function createCraftCommentImage(connection, craftCommentIdx, image){
  const query = `
  INSERT INTO CraftCommentImage(craftCommentIdx, imageUrl)
  VALUES (${craftCommentIdx}, ?);
  `;
  const [rows] = await connection.query(query, [image]);
  return rows;
}

//이미 댓글 작성한 orderCraftIdx인지
async function isAlreadyWrittenComment(connection, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT craftCommentIdx
    FROM CraftComment
    WHERE orderCraftIdx = ${orderCraftIdx} && isDeleted = 'N') AS isExists;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExists'];
}

//댓글을 작성할 수 있는 상태의 orderCraftIdx인지
async function isPossibleToWriteComment(connection, orderCraftIdx){
  const query = `
  SELECT IF(orderStatusIdx = ${ORDER_STATUS.DELIVERY_COMPLETED}, 1, 0) AS canWrite
  FROM OrderCraft
  WHERE orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['canWrite'];
}

//상품 댓글 삭제
async function deleteCraftComment(connection, craftCommentIdx){
  const query = `
  UPDATE CraftComment
  SET isDeleted = 'Y'
  WHERE craftCommentIdx = ${craftCommentIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//유저의 상품 댓글 전체 삭제
async function deleteUserCraftComment(connection, userIdx){
  const getUserCraftCommentQuery = `
  SELECT CC.craftCommentIdx
  FROM CraftComment CC
          JOIN OrderCraft OC ON OC.orderCraftIdx = CC.orderCraftIdx
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
  WHERE O.userIdx = ${userIdx} && CC.isDeleted = 'N';
  `;
  let [rows] = await connection.query(getUserCraftCommentQuery);
  const userCraftCommentIdxArr = rows.length > 0 ? rows.map(item => item.craftCommentIdx) : [-1];

  const deleteUserCraftCommentQuery = `
  UPDATE CraftComment
  SET isDeleted = 'Y'
  WHERE craftCommentIdx IN (?)
  `;
  [rows] = await connection.query(deleteUserCraftCommentQuery, [userCraftCommentIdxArr]);
  return rows;
}

module.exports = {
  getOnlyPhotoCommentCnt,
  getCommentCnt,
  getCommentInfoOnlyPhoto,
  getCommentInfo,
  getCommentImageUrlArr,
  isExistCraftCommentIdx,
  isAlreadyReportedCraftComment,
  isUserCraftComment,
  reportCraftComment,
  createCraftComment,
  updatePhotoCraftComment,
  createCraftCommentImage,
  isAlreadyWrittenComment,
  isPossibleToWriteComment,
  deleteCraftComment,
  deleteUserCraftComment,
}