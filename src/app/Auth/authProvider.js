const authDao = require('./authDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const nodemailer = require("nodemailer");
const Cache = require("memory-cache");
const CryptoJS = require("crypto-js");
const {createJwt} = require("../../../modules/userUtil");

//인증번호 발급
exports.createVerificationCode = async (email) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //이미 가입한 이메일인지
      const isExistEmail = await authDao.isExistEmail(connection, email);
      if (isExistEmail){
        connection.release();
        return errResponse(baseResponse.ALREADY_EXISTED_EMAIL);
      }
      
      Cache.del(email);

      let verificationCode = '';
      for (let i=0; i<6; i++){
        verificationCode += parseInt(Math.random()*10);
      }

      Cache.put(email, verificationCode, 1000*60*3);
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD,
        }
      });
    
      const info = await transporter.sendMail({
        from: '손길',
        to: email,
        subject: '손길 테스트 중입니다.',
        html: `인증번호 테스트 중 입니다.<br/><b>${verificationCode}</b>`
      });
      
      connection.release();
      return response(baseResponse.SUCCESS);
    }catch(err){
      connection.release();
      logger.error(`createVerificationCode DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`createVerificationCode DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//이메일 인증번호 확인
exports.checkVerificationCode = async (email, code) => {
  const cacheData = Cache.get(email);
  if (!cacheData) return errResponse(baseResponse.INVALID_CODE);
  if (cacheData != code) return errResponse(baseResponse.INVALID_CODE);

  Cache.del(email);

  return response(baseResponse.SUCCESS);
}

//닉네임 중복 체크
exports.checkNickname = async (nickname) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //기존에 존재하는 닉네임인지
      const isExistNickname = await authDao.isExistNickname(connection, nickname);
      if (isExistNickname){
        connection.release();
        return errResponse(baseResponse.DUPLICATED_NICKNAME);
      }

      connection.release();
      return response(baseResponse.SUCCESS);
    }catch(err){
      connection.release();
      logger.error(`checkNickname DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`checkNickname DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//로그인
exports.login = async (email, password) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 이메일인지
      const isExistEmail = await authDao.isExistEmail(connection, email);
      if (!isExistEmail){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_INFO);
      }

      //암호화 한 비밀번호 가져오기
      const encryptedPassword = await authDao.getPassword(connection, email);

      //복호화하기
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, process.env.ENCODE_SECRET_KEY);
      const decryptedPassword = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (password != decryptedPassword){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_INFO);
      }

      const userIdx = await authDao.getUserIdx(connection, email, encryptedPassword);
      const token = await createJwt(userIdx);

      const result = {
        'jwt': token
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);
    }catch(err){
      connection.release();
      logger.error(`login DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`checkNickloginname DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//자동 로그인
exports.autoLogin = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const isExistUser = await authDao.isExistUser(connection, userIdx);
      if (!isExistUser){
        connection.release();
        return errResponse(baseResponse.INVALID_USER_INFO);
      }

      connection.release();
      return response(baseResponse.SUCCESS);
    }catch(err){
      connection.release();
      logger.error(`autoLogin DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`autoLogin DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}