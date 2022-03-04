const authDao = require('./authDao');
const storyDao = require('../Story/storyDao');
const storyCommentDao = require('../StoryComment/storyCommentDao');
const qnaDao = require('../QnA/qnaDao');
const qnaCommentDao = require('../QnAComment/qnaCommentDao');
const abTestDao = require('../ABTest/abTestDao');
const abTestCommentDao = require('../ABTestComment/abTestCommentDao');
const craftDao = require('../Craft/craftDao');
const craftCommentDao = require('../CraftComment/craftCommentDao');
const artistPlaceDao = require('../ArtistPlace/artistPlaceDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const CryptoJS = require("crypto-js");
const {createJwt} = require("../../../modules/userUtil");

//회원가입
exports.createUser = async (email, password, nickname) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //이미 가입한 이메일인지
      const isExistEmail = await authDao.isExistEmail(connection, email);
      if (isExistEmail){
        connection.release();
        return errResponse(baseResponse.ALREADY_EXISTED_EMAIL);
      }
      
      //기존에 존재하는 닉네임인지
      const isExistNickname = await authDao.isExistNickname(connection, nickname);
      if (isExistNickname){
        connection.release();
        return errResponse(baseResponse.DUPLICATED_NICKNAME);
      }

      const encryptedPassword = CryptoJS.AES.encrypt(JSON.stringify(password), process.env.ENCODE_SECRET_KEY).toString();

      // const bytes = CryptoJS.AES.decrypt(encryptedPassword, process.env.ENCODE_SECRET_KEY);
      // const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const createUser = await authDao.createUser(connection, email, encryptedPassword, nickname);
      const userIdx = createUser.insertId;

      const token = await createJwt(userIdx);
      
      const result = {
        'jwt': token
      };

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

//회원 탈퇴
exports.deleteUser = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const artistIdx = await authDao.getArtistIdx(connection, userIdx);
      await connection.beginTransaction();

      await storyDao.deleteUserStory(connection, userIdx);
      await storyCommentDao.deleteUserStoryComment(connection, userIdx);
      await qnaDao.deleteUserQnA(connection, userIdx);
      await qnaCommentDao.deleteUserQnAComment(connection, userIdx);
      await abTestCommentDao.deleteUserABTestComment(connection, userIdx);
      await craftCommentDao.deleteUserCraftComment(connection, userIdx);

      if (artistIdx){
        await artistPlaceDao.deleteArtist(connection, artistIdx);
        await craftDao.deleteUserCraft(connection, artistIdx);
        await abTestDao.deleteUserABTest(connection, artistIdx);
      }

      await authDao.deleteUser(connection, userIdx);

      await connection.commit();

      connection.release();
      return response(baseResponse.SUCCESS);

    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`deleteUser DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`deleteUser DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}