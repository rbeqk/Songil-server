//1:1문의 작성
async function createCraftAsk(connection, userIdx, craftIdx, content){
  const query = `
  INSERT INTO CraftAsk (userIdx, craftIdx, content)
  VALUES (${userIdx}, ${craftIdx}, '${content}');
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//사용자별 1:1 문의 리스트 가져오기 (상품 및 작가 삭제해도 문의 내역은 동일하게 보임)
async function getAsk(connection, userIdx, startItemIdx, itemPerPage){
  const query = `
  SELECT CA.craftAskIdx                                as askIdx,
        CA.craftIdx,
        C.name,
        CA.content,
        DATE_FORMAT(CA.createdAt, '%Y.%m.%d. %k:%i')  as askCreatedAt,
        CA.craftAskStatusIdx                          as status,
        CAA.craftAskAnswerIdx,
        A.artistIdx,
        U.nickname                                    as artistName,
        CAA.comment                                   as answerContent,
        DATE_FORMAT(CAA.createdAt, '%Y.%m.%d. %k:%i') as answerCreatedAt
  FROM CraftAsk CA
          JOIN Craft C ON C.craftIdx = CA.craftIdx
          LEFT JOIN CraftAskAnswer CAA on CA.craftAskIdx = CAA.craftAskIdx && CAA.isDeleted = 'N'
          JOIN Artist A on C.artistIdx = A.artistIdx
          JOIN User U on U.userIdx = A.userIdx
  WHERE CA.isDeleted = 'N' && CA.userIdx = ${userIdx}
  ORDER BY CA.craftAskIdx DESC
  LIMIT ${startItemIdx}, ${itemPerPage};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  createCraftAsk,
  getAsk,
}