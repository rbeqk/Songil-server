//1:1문의 작성
async function createProductAsk(connection, params){
  const query = `
  INSERT INTO ProductAsk (userIdx, productIdx, content)
  VALUES (?, ?, ?)
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

//사용자별 1:1 문의 개수 가져오기
async function getAskCnt(connection, params){
  const query = `
  SELECT COUNT(productAskIdx) as totalCnt FROM ProductAsk
  WHERE isDeleted = 'N' && userIdx = ?
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}

//사용자별 1:1 문의 리스트 가져오기 (상품 및 작가 삭제해도 문의 내역은 동일하게 보임)
async function getAsk(connection, params){
  const query = `
  SELECT PA.productAskIdx,
        PA.productIdx,
        P.name,
        PA.content,
        DATE_FORMAT(PA.createdAt, '%Y.%m.%d. %k:%i')                as askCreatedAt,
        PA.productAskStatusIdx                                      as status,
        PAA.productAskAnswerIdx,
        A.artistIdx,
        U.nickname                                                  as artistName,
        PAA.comment                                                 as answerContent,
        DATE_FORMAT(PAA.createdAt, '%Y.%m.%d. %k:%i')               as answerCreatedAt
  FROM ProductAsk PA
          JOIN Product P ON P.productIdx = PA.productIdx
          LEFT JOIN ProductAskAnswer PAA on PA.productAskIdx = PAA.productAskIdx && PAA.isDeleted = 'N'
          JOIN Artist A on P.artistIdx = A.artistIdx
          JOIN User U on U.userIdx = A.userIdx
  WHERE PA.isDeleted = 'N' && PA.userIdx = ?
  LIMIT ?, ?;
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  createProductAsk,
  getAskCnt,
  getAsk,
}