async function getNotice(connection){
  const query = `
  SELECT title, content FROM Notice
  WHERE isDeleted = 'N'
  ORDER BY noticeIdx DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getNotice,
}