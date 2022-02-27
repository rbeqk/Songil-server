async function getNotice(connection){
  const query = `
  SELECT title, content FROM Notice
  WHERE isDeleted = 'N'
  ORDER BY noticeIdx DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

async function getFAQ(connection){
  const query = `
  SELECT title, content FROM FAQ
  WHERE isDeleted = 'N'
  ORDER BY faqIdx DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getNotice,
  getFAQ,
}