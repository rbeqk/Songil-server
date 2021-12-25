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

  INVALID_CRAFT_IDX: {"isSuccess": false, "code": 2301, "message": "존재하지 않는 craftIdx입니다"},
  INVALID_CONSUMER_IDX: {"isSuccess": false, "code": 2302, "message": "존재하지 않는 소비자입니다"},
  INVALID_PAGE: {"isSuccess": false, "code": 2303, "message": "존재하지 않는 page입니다"},
  INVALID_USER_SEARCH_IDX: {"isSuccess": false, "code": 2304, "message": "유저의 검색항목이 아닙니다"},
  INVALD_CRAFT_COMMENT_IDX: {"isSuccess": false, "code": 2305, "message": "존재하지 않는 commentIdx입니다"},
  INVALID_REPORTED_REASON_IDX: {"isSuccess": false, "code": 2306, "message": "존재하지 않는 reportedReasonIdx입니다"},
  INVALID_ARTICLE_IDX: {"isSuccess": false, "code": 2307, "message": "존재하지 않는 articleIdx입니다"},
  INVALID_ARTIST_IDX: {"isSuccess": false, "code": 2308, "message": "존재하지 않는 artistIdx입니다"},
  INVALID_ASK_IDX: {"isSuccess": false, "code": 2309, "message": "존재하지 않는 askIdx입니다"},
  INVALID_CATEGORY_IDX: {"isSuccess": false, "code": 2310, "message": "존재하지 않는 categoryIdx입니다"},
  INVALID_STORY_IDX: {"isSuccess": false, "code": 2311, "message": "존재하지 않는 storyIdx입니다"},
  INVALID_QNA_IDX: {"isSuccess": false, "code": 2312, "message": "존재하지 않는 qnaIdx입니다"},
  INVALID_ABTEST_IDX: {"isSuccess": false, "code": 2313, "message": "존재하지 않는 abTestIdx입니다"},
  INVALID_PARENT_IDX: {"isSuccess": false, "code": 2314, "message": "존재하지 않는 parentIdx입니다"},
  INVALID_SORT_NAME: {"isSuccess": false, "code": 2315, "message": "존재하지 않는 sort입니다"},

  EXCEED_ASK_CONTENT: {"isSuccess": false, "code": 2350, "message": "content는 300자 이하로 입력해주세요"},
  EXCEED_REPORTED_REASON: {"isSuccess": false, "code": 2351, "message": "신고 사유는 150자 이하로 입력해주세요"},
  EXCEED_CRAFT_ASK_COMMENT_REASON: {"isSuccess": false, "code": 2352, "message": "문의 답변은 300자 이하로 입력해주세요"},
  EXCEED_QNA_TITLE: {"isSuccess": false, "code": 2353, "message": "title은 300자 이하로 입력해주세요"},
  EXCEED_QNA_CONTENT: {"isSuccess": false, "code": 2354, "message": "content은 3000자 이하로 입력해주세요"},
  EXCEED_STORY_COMMENT: {"isSuccess": false, "code": 2354, "message": "comment는 500자 이하로 입력해주세요"},
  EXCEED_QNA_COMMENT: {"isSuccess": false, "code": 2355, "message": "comment는 500자 이하로 입력해주세요"},
  EXCEED_ABTEST_COMMENT: {"isSuccess": false, "code": 2356, "message": "comment는 500자 이하로 입력해주세요"},
  EXCEED_STORY_TITLE: {"isSuccess": false, "code": 2357, "message": "title은 100자 이하로 입력해주세요"},
  EXCEED_STORY_CONTENT: {"isSuccess": false, "code": 2358, "message": "content는 2000자 이하로 입력해주세요"},
  EXCEED_STORY_TAG: {"isSuccess": false, "code": 2359, "message": "tag는 3개 이하로 입력해주세요"},
  EXCEED_ABTEST_CONTENT: {"isSuccess": false, "code": 2360, "message": "content는 3000자 이하로 입력해주세요"},
  EXCEED_DATE: {"isSuccess": false, "code": 2361, "message": "유효한 날짜를 입력해주세요"},
  INVALID_IMAGE_QUANTITY: {"isSuccess": false, "code": 2362, "message": "이미지 개수를 확인해주세요"},

  NO_PERMISSION: {"isSuccess": false, "code": 2400, "message": "권한이 없습니다"},
  CAN_NOT_REPORT_SELF: {"isSuccess": false, "code": 2401, "message": "자신의 댓글은 신고할 수 없습니다"},
  IS_ALREADY_COMMENT_ASK_IDX: {"isSuccess": false, "code": 2402, "message": "이미 답변한 문의입니다"},
  CAN_NOT_COMMENT_TO_DELETED_CRAFT: {"isSuccess": false, "code": 2403, "message": "삭제된 상품의 문의에 대해서는 답변할 수 없습니다"},

  //Response
  INVALD_VERIFICATIONCODE: {"isSuccess": false, "code": 3100, "message": "올바르지 않은 인증번호입니다"},
  GET_VERIFICATIONCODE_FIRST: {"isSuccess": false, "code": 3101, "message": "인증번호를 먼저 발급해주세요"},

  DUPLICATED_PHONE: {"isSuccess": false, "code": 3200, "message": "이미 가입한 핸드폰 번호입니다"},
  DUPLICATED_NICKNAME: {"isSuccess": false, "code": 3201, "message": "중복된 닉네임입니다"},
  ALREADY_REPORTED_CRAFT_COMMENT_IDX: {"isSuccess": false, "code": 3202, "message": "기존에 신고한 댓글입니다"},

  EMPTY_USER_SEARCH: {"isSuccess": false, "code": 3300, "message": "사용자의 최근 검색어가 없습니다"},

  DB_ERROR: {"isSuccess": false, "code": 4000, "message": "DB 에러"},
  SERVER_ERROR: {"isSuccess": false, "code": 4001, "message": "Server 에러"},
}