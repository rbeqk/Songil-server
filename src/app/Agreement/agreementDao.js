//이용약관 전체
async function getAgreements(connection){
  const query = `
  SELECT agreementIdx, title, IF(content, 'Y', 'N') as hasContent, isRequired
  FROM Agreement
  WHERE isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//존재하는 agreementIdx인지
async function isExistAgreementIdx(connection, params){
  const query = `
  SELECT EXISTS(SELECT agreementIdx FROM Agreement WHERE isDeleted = 'N' && agreementIdx = ?) as isExist;
  `;
  const [rows] = await connection.query(query, params);
  return rows[0]['isExist'];
}

//이용약관 상세
async function getAgreementDetail(connection, params){
  const query = `
  SELECT agreementIdx, content FROM Agreement
  WHERE agreementIdx = ? && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, params);
  return rows[0];
}

module.exports = {
  getAgreements,
  isExistAgreementIdx,
  getAgreementDetail,
}