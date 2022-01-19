const authDao = require('./authDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const nodemailer = require("nodemailer");
const Cache = require("memory-cache");

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