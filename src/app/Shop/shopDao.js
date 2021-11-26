//today-craft 총 개수(=상품 총 개수)
async function getTodayCraftTotalCnt(connection){
  const query = `
  SELECT COUNT(productIdx) as totalCnt
  FROM Product
  WHERE isDeleted = 'N'
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

module.exports = {
  getTodayCraftTotalCnt,
}