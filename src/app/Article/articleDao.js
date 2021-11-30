async function getArticleList(connection, params){
  const query = `
  SELECT A.articleIdx,
        A.articleCategoryIdx,
        A.title,
        A.editorIdx,
        E.nickname                                  as editorName,
        A.mainImageUrl,
        DATE_FORMAT(A.createdAt, '%Y.%m.%d. %k:%i') as createdAt
  FROM Article A
          JOIN Editor E on A.editorIdx = E.editorIdx && E.isDeleted = 'N'
  WHERE A.isDeleted = 'N'
  ORDER BY A.createdAt DESC
  LIMIT 15
  `;
  const [rows] = await connection.query(query, params);
  return rows;
}

module.exports = {
  getArticleList,
}