const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUserIdx = (token) => {
  if (token){
    try{
      userIdx = jwt.verify(token, process.env.jwtSecret).userIdx;
    }catch(err){
      return false;
    }
  }
  else{
    userIdx = -1; //token이 존재하지 않을 경우 존재하지 않는 userIdx로 반환
  }

  return userIdx;
}

module.exports = {
  getUserIdx,
}