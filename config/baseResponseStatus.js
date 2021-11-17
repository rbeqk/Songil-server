module.exports = {
  SUCCESS: { "isSuccess": true, "code": 1000, "message": "성공" },
  // Common
  TOKEN_EMPTY: { "isSuccess": false, "code": 2000, "message": "JWT 토큰이 입력되지 않았습니다." },
  TOKEN_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3000, "message": "JWT 토큰 검증 실패" },

  IS_EMPTY: {"isSuccess": false, "code": 2100, "message": "공백이 있습니다"},

  INVALID_PHONE_PATTERN: {"isSuccess": false, "code": 2200, "message": "올바르지 않은 핸드폰 번호 형식입니다"},

  INVALD_VERIFICATIONCODE: {"isSuccess": false, "code": 3100, "message": "올바르지 않은 인증번호입니다"},
  NOT_REQUIRED_VERIFICATIONCODE_NUMBER: {"isSuccess": false, "code": 3101, "message": "인증번호를 요청한 번호가 아닙니다"},
  EXPIRES_VERIFICATIONCODE: {"isSuccess": false, "code": 3102, "message": "만료된 인증번호입니다"},

  DB_ERROR: {"isSuccess": false, "code": 4001, "message": "DB 에러"},
  SERVER_ERROR: {"isSuccess": false, "code": 4001, "message": "Server 에러"},
}