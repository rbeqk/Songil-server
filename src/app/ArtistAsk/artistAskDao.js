//작가 여부
async function isArtist(connection, userIdx){
  const query = `
  SELECT EXISTS(SELECT userIdx
    FROM User
    WHERE isDeleted = 'N' && isArtist = 'Y' && userIdx = ${userIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//작가idx
async function getArtistIdx(connection, userIdx){
  const query = `
  SELECT artistIdx FROM Artist
  WHERE isDeleted = 'N' && userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['artistIdx'];
}

//작가의 총 1:1문의 개수
async function getAskCnt(connection, artistIdx){
  const query = `
  SELECT COUNT(A.askIdx) as totalCnt FROM Ask A
  LEFT JOIN OrderCraft OC ON A.orderCraftIdx = OC.orderCraftIdx
  JOIN Craft C ON C.craftIdx = IFNULL(A.craftIdx, OC.craftIdx)
  WHERE C.artistIdx = ${artistIdx} && A.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//작가 1:1문의 목록 가져오기(삭제된 상품에 대해서도 보이게)
async function getAskList(connection, artistIdx){
  const query = `
  SELECT CA.craftAskIdx as askIdx
  FROM CraftAsk CA
          JOIN Craft C ON C.craftIdx = CA.craftIdx
  WHERE CA.isDeleted = 'N' && C.artistIdx = ${artistIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//문의 목록 상세 정보 가져오기
async function getAskInfo(connection, askIdxList, startItemIdx, pageItemCnt){
  const query = `
  SELECT CA.craftAskIdx                               as askIdx,
        CA.craftIdx,
        C.name,
        C.mainImageUrl,
        U.nickname,
        CA.craftAskStatusIdx                         as status,
        DATE_FORMAT(CA.createdAt, '%Y.%m.%d. %k:%i') as createdAt
  FROM CraftAsk CA
          JOIN Craft C ON C.craftIdx = CA.craftIdx
          JOIN User U ON U.userIdx = CA.userIdx && U.isDeleted = 'N'
  WHERE CA.craftAskIdx IN (${askIdxList}) && CA.isDeleted = 'N'
  ORDER BY CA.createdAt
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//문의에 대한 작가 권한 확인
async function isArtistAsk(connection, craftAskIdx, artistIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM Craft C
    WHERE C.craftIdx = (SELECT CA.craftIdx
                        FROM CraftAsk CA
                        WHERE CA.isDeleted = 'N' && CA.craftAskIdx = ${craftAskIdx}) && C.artistIdx = ${artistIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//존재하는 craftAskIdx인지
async function isExistCraftAskIdx(connection, craftAskIdx){
  const query = `
  SELECT EXISTS(SELECT * FROM CraftAsk
    WHERE isDeleted = 'N' && craftAskIdx = ${craftAskIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}


//1:1 문의 상세 정보
async function getAskDetail(connection, craftAskIdx){
  const query = `
  SELECT CA.craftAskIdx as askIdx,
        CA.craftIdx,
        C.name,
        CA.userIdx,
        U.nickname     as userName,
        CA.content     as askContent,
        CAA.comment    as answerContent,
        C.isDeleted as craftIsDeleted
  FROM CraftAsk CA
      JOIN User U ON U.userIdx = CA.userIdx && U.isDeleted = 'N'
          JOIN Craft C ON C.craftIdx = CA.craftIdx
          LEFT JOIN CraftAskAnswer CAA on CA.craftAskIdx = CAA.craftAskIdx
  WHERE CA.isDeleted = 'N' && CA.craftAskIdx = ${craftAskIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//이미 답변한 문의인지
async function isAlreadyCommentAskIdx(connection, craftAskIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM CraftAskAnswer
    WHERE craftAskIdx = ${craftAskIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//삭제된 상품에 대한 문의인지
async function isDeletedCraftAskIdx(connection, craftAskIdx){
  const query = `
  SELECT IF(isDeleted ='Y', 1, 0) as status
  FROM Craft
  WHERE craftIdx = (SELECT craftIdx
                    FROM CraftAsk
                    WHERE craftAskIdx = ${craftAskIdx} && isDeleted = 'N');
  `;
  const [rows] = await connection.query(query);
  return rows[0]['status'];
}

//1:1문의 답변 작성
async function createAskComment(connection, craftAskIdx, comment){
  const query = `
  INSERT INTO CraftAskAnswer(craftAskIdx, comment)
  VALUES (${craftAskIdx}, '${comment}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  isArtist,
  getArtistIdx,
  getAskCnt,
  getAskList,
  getAskInfo,
  isArtistAsk,
  isExistCraftAskIdx,
  getAskDetail,
  isAlreadyCommentAskIdx,
  isDeletedCraftAskIdx,
  createAskComment,
}