const userDao = require('./userDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.checkDuplicated = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //핸드폰 번호 중복 확인
      if (params[1] === 0){
        const isExistPhone = await userDao.isExistPhone(connection, params[0]);
        connection.release();
        if (isExistPhone){
          return errResponse(baseResponse.DUPLICATED_PHONE);
        }
        else{
          return response(baseResponse.SUCCESS);
        }
      }
      //닉네임 중복 확인
      else if (params[1] === 1){
        const isExistNickname = await userDao.isExistNickname(connection, params[0]);
        connection.release();
        if (isExistNickname){
          return errResponse(baseResponse.DUPLICATED_NICKNAME);
        }
        else{
          return response(baseResponse.SUCCESS);
        }
      }
      
    }catch(err){
      connection.release();
      logger.error(`checkDuplicated DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`checkDuplicated DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.isExistPhone = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistPhone = await userDao.isExistPhone(connection, params);
      connection.release();
      return isExistPhone;
    }catch(err){
      connection.release();
      logger.error(`isExistPhone DB Query Error: ${err}`);
      return false;
    }
  }catch(err){
    logger.error(`isExistPhone DB Connection Error: ${err}`);
    return false;
  }
}

exports.getUserIdx = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const userIdx = await userDao.getUserIdx(connection, params);
      connection.release();
      return userIdx;
    }catch(err){
      connection.release();
      logger.error(`getUserIdx DB Query Error: ${err}`);
      return false;
    }
  }catch(err){
    logger.error(`getUserIdx DB Connection Error: ${err}`);
    return false;
  }
}