//총 리뷰 개수
async function getReviewCnt(connection, params){
  const query = `
  SELECT COUNT(productIdx) as totalReviewCnt FROM ProductReview
  WHERE productIdx = ? && isDeleted = 'N'
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['totalReviewCnt'];
}

module.exports = {
  getReviewCnt,
}