//1:1문의 작성
async function createCraftAsk(connection, userIdx, craftIdx, content){
  const query = `
  INSERT INTO Ask (craftIdx, userIdx, content)
  VALUES (${craftIdx}, ${userIdx}, ?);
  `;
  const [rows] = await connection.query(query, [content]);
  return rows;
}

//사용자별 1:1 문의 리스트 가져오기 (상품 및 작가 삭제해도 문의 내역은 동일하게 보임)
async function getAsk(connection, userIdx, startItemIdx, itemPerPage){
  const query = `
  SELECT A.askIdx,
        IF(A.craftIdx IS NOT NULL, A.craftIdx, OC.craftIdx) as craftIdx,
        C.name,
        A.content,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d. %k:%i')         as createdAt,
        A.askStatusIdx                                      as status,
        AA.askAnswerIdx,
        C.artistIdx,
        U.nickname                                          as artistName,
        AA.content                                          as answerContent,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d. %k:%i')         as answerCreatedAt
  FROM Ask A
          LEFT JOIN OrderCraft OC on A.orderCraftIdx = OC.orderCraftIdx
          LEFT JOIN AskAnswer AA on A.askIdx = AA.askIdx && AA.isDeleted = 'N'
          JOIN Craft C ON C.craftIdx = IFNULL(A.craftIdx, OC.craftIdx)
          JOIN Artist AR ON AR.artistIdx = C.artistIdx
          JOIN User U ON U.userIdx = AR.userIdx
  WHERE A.userIdx = ${userIdx} && A.isDeleted = 'N'
  ORDER BY A.askIdx DESC
  LIMIT ${startItemIdx}, ${itemPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  createCraftAsk,
  getAsk,
}