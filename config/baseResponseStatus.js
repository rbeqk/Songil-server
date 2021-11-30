module.exports = {
  SUCCESS: { "isSuccess": true, "code": 200, "message": "성공" },
  // Common
  TOKEN_EMPTY: { "isSuccess": false, "code": 2000, "message": "JWT 토큰이 입력되지 않았습니다" },
  TOKEN_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3000, "message": "JWT 토큰 검증 실패" },

  //Request
  IS_EMPTY: {"isSuccess": false, "code": 2100, "message": "공백이 있습니다"},

  INVALID_PHONE_PATTERN: {"isSuccess": false, "code": 2200, "message": "올바르지 않은 핸드폰 번호 형식입니다"},
  NOT_SIGN_UP_PHONE: {"isSuccess": false, "code": 2201, "message": "가입한 핸드폰 번호가 아닙니다"},

  NEED_PHONE_OR_NICKNAME: {"isSuccess": false, "code": 2210, "message": "핸드폰 번호/닉네임 중 하나를 입력해주세요"},
  NEED_JUST_ONE_CONDITION: {"isSuccess": false, "code": 2211, "message": "핸드폰 번호/닉네임 중 하나만 입력해주세요"},
  NEED_PAGE: {"isSuccess": false, "code": 2212, "message": "page를 입력해주세요"},
  SELECT_ANOTHER_ETC_REASON_IDX: {"isSuccess": false, "code": 2213, "message": "신고 사유 입력 시 직접 작성으로 체크해주세요"},

  INVALID_PRODUCT_IDX: {"isSuccess": false, "code": 2301, "message": "존재하지 않는 productIdx입니다"},
  INVALID_CONSUMER_IDX: {"isSuccess": false, "code": 2302, "message": "존재하지 않는 소비자입니다"},
  INVALID_PAGE: {"isSuccess": false, "code": 2303, "message": "존재하지 않는 page입니다"},
  INVALID_USER_SEARCH_IDX: {"isSuccess": false, "code": 2304, "message": "유저의 검색항목이 아닙니다"},
  INVALD_PRODUT_REVIEW_IDX: {"isSuccess": false, "code": 2305, "message": "존재하지 않는 productReviewIdx입니다"},
  INVALID_REPORTED_REASON_IDX: {"isSuccess": false, "code": 2306, "message": "존재하지 않는 reportedReasonIdx입니다"},
  INVALID_ARTICLE_IDX: {"isSuccess": false, "code": 2307, "message": "존재하지 않는 articleIdx입니다"},

  EXCEED_ASK_CONTENT: {"isSuccess": false, "code": 2350, "message": "content는 300자 이하로 입력해주세요"},
  EXCEED_REPORTED_REASON: {"isSuccess": false, "code": 2351, "message": "신고 사유는 150자 이하로 입력해주세요"},

  //Response
  INVALD_VERIFICATIONCODE: {"isSuccess": false, "code": 3100, "message": "올바르지 않은 인증번호입니다"},
  GET_VERIFICATIONCODE_FIRST: {"isSuccess": false, "code": 3101, "message": "인증번호를 먼저 발급해주세요"},

  DUPLICATED_PHONE: {"isSuccess": false, "code": 3200, "message": "이미 가입한 핸드폰 번호입니다"},
  DUPLICATED_NICKNAME: {"isSuccess": false, "code": 3201, "message": "중복된 닉네임입니다"},
  ALREADY_REPORTED_PRODUCT_REVIEW_IDX: {"isSuccess": false, "code": 3202, "message": "기존에 신고한 리뷰입니다"},

  EMPTY_USER_SEARCH: {"isSuccess": false, "code": 3300, "message": "사용자의 최근 검색어가 없습니다"},

  DB_ERROR: {"isSuccess": false, "code": 4000, "message": "DB 에러"},
  SERVER_ERROR: {"isSuccess": false, "code": 4001, "message": "Server 에러"},
}