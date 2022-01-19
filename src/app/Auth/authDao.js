async function isExistEmail(connection, email){
  const query = `
  SELECT EXISTS(SELECT * FROM User WHERE email = ? && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query, [email]);
  return rows[0]['isExist'];
}

module.exports = {
  isExistEmail,
}