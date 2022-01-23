//존재하는 이메일인지
async function isExistEmail(connection, email){
  const query = `
  SELECT EXISTS(SELECT * FROM User WHERE email = ? && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query, [email]);
  return rows[0]['isExist'];
}

//존재하는 닉네임인지
async function isExistNickname(connection, nickname){
  const query = `
  SELECT EXISTS(SELECT * FROM User WHERE nickname = ? && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query, [nickname]);
  return rows[0]['isExist'];
}

//유저 생성
async function createUser(connection, email, encryptedPassword, nickname){
  const query = `
  INSERT INTO User(email, password, nickname)
  VALUES (?, ?, ?);
  `;
  const [rows] = await connection.query(query, [email, encryptedPassword, nickname]);
  return rows;
}

//암호화한 비밀번호 가져오기
async function getPassword(connection, email){
  const query = `
  SELECT password FROM User
  WHERE email = ? && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [email]);
  return rows[0]['password'];
}

//로그인 시 userIdx 가져오기
async function getUserIdx(connection, email, encryptedPassword){
  const query = `
  SELECT userIdx
  FROM User
  WHERE email = ? && password = ? && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query, [email, encryptedPassword]);
  return rows[0]['userIdx'];
}

//존재하는 userIdx인지
async function isExistUser(connection, userIdx){
  const query = `
  SELECT EXISTS(SELECT userIdx FROM User WHERE userIdx = ${userIdx} && isDeleted = 'N') as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

module.exports = {
  isExistEmail,
  isExistNickname,
  createUser,
  getPassword,
  getUserIdx,
  isExistUser,
}