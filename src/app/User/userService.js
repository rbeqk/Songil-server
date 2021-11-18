const userDao = require('./userDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.createUser = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      //핸드폰 번호 중복 확인
      const isExistPhone = await userDao.isExistPhone(connection, params[0]);
      if (isExistPhone) return errResponse(baseResponse.DUPLICATED_PHONE);

      //닉네임 중복 확인
      const isExistNickname = await userDao.isExistNickname(connection, params[1]);
      if (isExistNickname)  return errResponse(baseResponse.DUPLICATED_NICKNAME);

      await connection.beginTransaction();

      //DB 저장
      const newUser = await userDao.createUser(connection, params);

      //jwt 생성
      const newUserIdx = newUser.insertId;
      let token = await jwt.sign(
        {userIdx: newUserIdx},
        process.env.jwtSecret,
        {expiresIn: '7d'}
      )
      
      const result = {'jwt': token};

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`createUser DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createUser DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}