const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const SHA256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64')
const axios = require('axios');

require('dotenv').config();

/*
  API No. 1.1
  API Name: 인증번호 발급 API
  [POST] /auth
  body: phone
*/
exports.getVerificationCode = async (req, res) => {
  const {phone} = req.body;
  if (!phone) return res.send(errResponse(baseResponse.IS_EMPTY));

  const regPhone = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
  if (!regPhone.test(phone)) return res.send(errResponse(baseResponse.INVALID_PHONE_PATTERN));

  const hostPhone = process.env.hostPhone;
  const naverServiceId = process.env.naverServiceId;
  const naverSecretKey = process.env.naverSecretKey;
  const naverAccessKey = process.env.naverAccessKey;

  const date = Date.now().toString();
  const method = 'POST';
  const space = ' ';
  const newLine = '\n';
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${naverServiceId}/messages`;
  const url2 = `/sms/v2/services/${naverServiceId}/messages`;

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, naverSecretKey);

  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(naverAccessKey);

  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);

  //6자리 인증번호 생성
  let verificationCode = '';
  for (let i=0; i<6; i++){
    verificationCode += Math.floor(Math.random()*10);
  }

  const body = {
    'type': 'SMS',
    'countryCode': '82',
    'from': hostPhone,
    'contentType': 'COMM',
    'content': `개발 테스트 중입니다.\n [손길]휴대폰 본인확인 인증번호 [${verificationCode}]`,
    'messages': [
      {
        'to': phone
      }
    ]
  };

  const options = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-iam-access-key': naverAccessKey,
			'x-ncp-apigw-timestamp': date,
			'x-ncp-apigw-signature-v2': signature
    }
  }

  //인증번호 보내기
  const sendVerificationCode = axios
  .post(url, body, options)
  .then((result) => {
    //세션에 저장
    req.session.phone = phone;
    req.session.verificationCode = verificationCode;
    return res.send(response(baseResponse.SUCCESS));
  })
  .catch((err) => {
    console.log(`AXIOS ERROR: ${err}`);
    return res.send(errResponse(baseResponse.SERVER_ERROR));
  });

  return sendVerificationCode;
}


/*
  API No. 1.2
  API Name: 회원가입 시 인증번호 확인 API
  [GET] /auth
  queryString: phone, verificationCode
*/
exports.verifyVerficationCode = async (req, res) => {
  const {phone, verificationCode} = req.query;

  if (!(phone && verificationCode)) return res.send(errResponse(baseResponse.IS_EMPTY));

  const regPhone = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
  if (!regPhone.test(phone)) return res.send(errResponse(baseResponse.INVALID_PHONE_PATTERN));

  //세션에 존재하지 않을 때(만료)
  if (!(req.session.phone && req.session.verificationCode)) return res.send(errResponse(baseResponse.EXPIRES_VERIFICATIONCODE));

  //인증번호를 요청한 번호가 아닐 때
  if (req.session.phone != phone) return res.send(errResponse(baseResponse.NOT_REQUIRED_VERIFICATIONCODE_NUMBER));
  else if (req.session.phone == phone && req.session.verificationCode != verificationCode) return res.send(errResponse(baseResponse.INVALD_VERIFICATIONCODE));
  else return res.send(response(baseResponse.SUCCESS));
}