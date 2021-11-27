//사용자별 1:1 문의 개수 가져오기
async function getAskCnt(connection, params){
  const query = `
  SELECT COUNT(productAskIdx) as totalCnt FROM ProductAsk
  WHERE isDeleted = 'N' && userIdx = ?
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalCnt'];
}

module.exports = {
  getAskCnt,
}