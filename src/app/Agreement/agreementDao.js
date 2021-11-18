async function getAgreements(connection){
  const query = `
  SELECT agreementIdx, title, IF(content, 'Y', 'N') as hasContent, isRequired
  FROM Agreement
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getAgreements,
}