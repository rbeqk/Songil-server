const { errResponse, response } = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const authDao = require("../Auth/authDao");
const withDao = require("./withDao");

exports.blockUser = async (userIdx, blockUserIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistUser = await authDao.isExistUser(connection, blockUserIdx);
      if (!isExistUser){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_IDX);
      }

      const isBlocked = await withDao.isBlocked(connection, userIdx, blockUserIdx);
      if (isBlocked){
        connection.release();
        return errResponse(baseResponse.ALREADY_BLOCKED_USER_IDX);
      }

      await connection.beginTransaction();
      await withDao.blockUser(connection, userIdx, blockUserIdx);
      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);

    }catch(err){
      connection.release();
      logger.error(`blockUser DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }
  catch(err){
    logger.error(`blockUser DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}