const myPageDao = require('./myPageDao');
const authDao = require('../Auth/authDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//유저 프로필 수정
exports.updateUserProfile = async (userIdx, setDefault, userName, userProfile) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //기존에 존재하는 닉네임인지
      if (userName){
        const isExistNickname = await myPageDao.isExistNickname(connection, userIdx, userName);
        if (isExistNickname){
          connection.release();
          return errResponse(baseResponse.DUPLICATED_NICKNAME);
        }
      }

      await connection.beginTransaction();
      await myPageDao.updateUserProfile(connection, userIdx, setDefault, userName, userProfile);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);

    }catch(err){
      connection.release();
      logger.error(`updateUserProfile DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`updateUserProfile DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}