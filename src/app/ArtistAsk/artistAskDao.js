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
  SELECT A.askIdx FROM Ask A
  LEFT JOIN OrderCraft OC ON A.orderCraftIdx = OC.orderCraftIdx
  JOIN Craft C ON C.craftIdx = IFNULL(A.craftIdx, OC.craftIdx)
  WHERE C.artistIdx = ${artistIdx} && A.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);

  //작가의 문의 목록 없을 경우 유효하지 않은 값으로 설정
  return rows.length > 0 ? rows.map(item => item.askIdx) : -1;
}

//문의 목록 상세 정보 가져오기
async function getAskInfo(connection, askList, startItemIdx, pageItemCnt){
  const query = `
  SELECT A.askIdx,
        IFNULL(A.craftIdx, OC.craftIdx)             as craftIdx,
        C.name,
        U.nickname,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d. %k:%i') as createdAt,
        A.askStatusIdx as status
  FROM Ask A
          LEFT JOIN OrderCraft OC ON A.orderCraftIdx = OC.orderCraftIdx
          JOIN Craft C ON C.craftIdx = IFNULL(A.craftIdx, OC.craftIdx)
          JOIN User U ON U.userIdx = A.userIdx
  WHERE A.askIdx IN (?) && A.isDeleted = 'N'
  LIMIT ${startItemIdx}, ${pageItemCnt};
  `;
  const [rows] = await connection.query(query, [askList]);
  return rows;
}

//문의에 대한 작가 권한 확인
async function isArtistAsk(connection, askIdx, artistIdx){
  const query = `
  SELECT EXISTS(SELECT A.askIdx
      FROM Ask A
              LEFT JOIN OrderCraft OC ON A.orderCraftIdx = OC.orderCraftIdx
              JOIN Craft C ON C.craftIdx = IFNULL(A.craftIdx, OC.craftIdx)
      WHERE A.askIdx = ${askIdx} && C.artistIdx = ${artistIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//존재하는 askIdx인지
async function isExistAskIdx(connection, askIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM Ask
    WHERE isDeleted = 'N' && askIdx = ${askIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}


//1:1 문의 상세 정보
async function getAskDetail(connection, askIdx){
  const query = `
    SELECT A.askIdx,
        IFNULL(A.craftIdx, OC.craftIdx) as craftIdx,
        C.name,
        A.userIdx,
        U.nickname,
        A.content                       as askContent,
        AA.content                      as answerContent,
        C.isDeleted                     as craftIsDeleted
  FROM Ask A
          LEFT JOIN OrderCraft OC ON A.orderCraftIdx = OC.orderCraftIdx
          JOIN Craft C ON C.craftIdx = IFNULL(A.craftIdx, OC.craftIdx)
          JOIN User U ON U.userIdx = A.userIdx
          LEFT JOIN AskAnswer AA on A.askIdx = AA.askIdx
  WHERE A.askIdx = ${askIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//이미 답변한 문의인지
async function isAlreadyAnswerAskIdx(connection, askIdx){
  const query = `
  SELECT EXISTS(SELECT AA.askAnswerIdx
    FROM AskAnswer AA
    WHERE AA.askIdx = ${askIdx} && AA.isDeleted = 'N') as isExist;
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
async function createAskComment(connection, askIdx, content){
  const query = `
  INSERT INTO AskAnswer(askIdx, content)
  VALUES (${askIdx}, ?);
  `;
  const [rows] = await connection.query(query, [content]);
  return rows;
}

module.exports = {
  isArtist,
  getArtistIdx,
  getAskCnt,
  getAskList,
  getAskInfo,
  isArtistAsk,
  isExistAskIdx,
  getAskDetail,
  isAlreadyAnswerAskIdx,
  isDeletedCraftAskIdx,
  createAskComment,
}