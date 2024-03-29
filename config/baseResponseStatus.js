module.exports = {
  SUCCESS: { "isSuccess": true, "code": 200, "message": "성공" },
  // Common
  TOKEN_EMPTY: { "isSuccess": false, "code": 2000, "message": "JWT 토큰이 입력되지 않았습니다" },
  TOKEN_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3000, "message": "JWT 토큰 검증 실패" },

  //Request
  IS_EMPTY: {"isSuccess": false, "code": 2100, "message": "공백이 있습니다"},
  UPDATE_INFO_EMPTY:{"isSuccess": false, "code": 2101, "message": "수정할 정보를 입력해주세요"},

  INVALID_PHONE_PATTERN: {"isSuccess": false, "code": 2200, "message": "올바르지 않은 핸드폰 번호 형식입니다"},
  NOT_SIGN_UP_PHONE: {"isSuccess": false, "code": 2201, "message": "가입한 핸드폰 번호가 아닙니다"},
  INVALID_EMAIL_TYPE: {"isSuccess": false, "code": 2202, "message": "올바르지 않은 이메일 형식입니다"},

  NEED_PHONE_OR_NICKNAME: {"isSuccess": false, "code": 2210, "message": "핸드폰 번호/닉네임 중 하나를 입력해주세요"},
  NEED_JUST_ONE_CONDITION: {"isSuccess": false, "code": 2211, "message": "핸드폰 번호/닉네임 중 하나만 입력해주세요"},
  NEED_PAGE: {"isSuccess": false, "code": 2212, "message": "page를 입력해주세요"},
  SELECT_ANOTHER_ETC_REASON_IDX: {"isSuccess": false, "code": 2213, "message": "사유 입력 시 직접 작성으로 체크해주세요"},

  INVALID_CRAFT_IDX: {"isSuccess": false, "code": 2301, "message": "존재하지 않는 craftIdx입니다"},
  INVALID_CONSUMER_IDX: {"isSuccess": false, "code": 2302, "message": "존재하지 않는 소비자입니다"},
  INVALID_PAGE: {"isSuccess": false, "code": 2303, "message": "페이지는 1 이상 입력해주세요"},
  INVALID_USER_SEARCH: {"isSuccess": false, "code": 2304, "message": "유저의 검색항목이 아닙니다"},
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
  INVALID_STORY_COMMENT_IDX: {"isSuccess": false, "code": 2316, "message": "존재하지 않는 스토리 commentIdx입니다"},
  INVALID_QNA_COMMENT_IDX: {"isSuccess": false, "code": 2317, "message": "존재하지 않는 QnA commentIdx입니다"},
  INVALID_ABTEST_COMMENT_IDX: {"isSuccess": false, "code": 2318, "message": "존재하지 않는 ABTest commentIdx입니다"},
  INVALID_TYPE_NAME: {"isSuccess": false, "code": 2319, "message": "존재하지 않는 type입니다"},
  INVALID_VOTE_NAME: {"isSuccess": false, "code": 2320, "message": "존재하지 않는 vote입니다"},
  INVALID_CATEGORY_NAME: {"isSuccess": false, "code": 2321, "message": "존재하지 않는 category입니다"},
  INVALID_AMOUNT: {"isSuccess": false, "code": 2322, "message": "수량은 1 이상이여야 합니다"},
  SOLD_OUT_CRAFT_IDX: {"isSuccess": false, "code": 2323, "message": "품절된 craftIdx입니다"},
  NOT_IN_CART_CRAFT_IDX: {"isSuccess": false, "code": 2324, "message": "장바구니에 담긴 craftIdx가 아닙니다"},
  INVALID_AMOUNT_CHANGE:{"isSuccess": false, "code": 2325, "message": "수량 변경을 확인해주세요"},
  INVALID_FORMAT_TYPE: {"isSuccess": false, "code": 2326, "message": "타입을 확인해주세요"},
  INVALID_ORDER_IDX: {"isSuccess": false, "code": 2327, "message": "존재하지 않는 orderIdx입니다"},
  INVALID_RECEIPT_ID: {"isSuccess": false, "code": 2328, "message": "존재하지 않는 receiptId입니다"},
  INVALID_POINT: {"isSuccess": false, "code": 2329, "message": "사용할 수 없는 포인트 값입니다"},
  INVALID_ORDER_CRAFT_IDX: {"isSuccess": false, "code": 2340, "message": "존재하지 않는 orderDetailIdx입니다"},
  INVALID_REASON_IDX: {"isSuccess": false, "code": 2341, "message": "존재하지 않는 reasonIdx입니다"},
  INVALID_USER_IDX: {"isSuccess": false, "code": 2342, "message": "존재하지 않는 userIdx입니다"},

  EXCEED_ASK_CONTENT: {"isSuccess": false, "code": 2350, "message": "content는 300자 이하로 입력해주세요"},
  EXCEED_REPORTED_REASON: {"isSuccess": false, "code": 2351, "message": "etcReason은 150자 이하로 입력해주세요"},
  EXCEED_CRAFT_ASK_CONTENT_REASON: {"isSuccess": false, "code": 2352, "message": "문의 답변은 300자 이하로 입력해주세요"},
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
  EXCEED_IMAGE_QUANTITY: {"isSuccess": false, "code": 2363, "message": "이미지는 3개 이하로 입력해주세요"},
  EXCEED_CRAFT_COMMENT: {"isSuccess": false, "code": 2364, "message": "comment는 500자 이하로 입력해주세요"},
  EXCEED_CART_CNT: {"isSuccess": false, "code": 2365, "message": "장바구니에는 최대 100개까지만 담을 수 있습니다"},
  EXCEED_TAG_LENGTH: {"isSuccess": false, "code": 2366, "message": "태그는 20글자 이하로 설정해주세요"},
  EXCEED_NICKNAME: {"isSuccess": false, "code": 2367, "message": "닉네임은 10글자 이하로 설정해주세요"},
  EXCEED_MEMO_LENGTH: {"isSuccess": false, "code": 2368, "message": "배송메모는 50글자 이하로 설정해주세요"},
  EXCEED_ETC_REASON: {"isSuccess": false, "code": 2369, "message": "기타 사유는 150글자 이하로 입력해주세요"},

  NO_PERMISSION: {"isSuccess": false, "code": 2400, "message": "권한이 없습니다"},
  CAN_NOT_REPORT_SELF: {"isSuccess": false, "code": 2401, "message": "자신의 글은 신고할 수 없습니다"},
  IS_ALREADY_ANSWER_ASK_IDX: {"isSuccess": false, "code": 2402, "message": "이미 답변한 문의입니다"},
  CAN_NOT_COMMENT_TO_DELETED_CRAFT: {"isSuccess": false, "code": 2403, "message": "삭제된 상품의 문의에 대해서는 답변할 수 없습니다"},
  CAN_NOT_USE_BENEFIT_IDX: {"isSuccess": false, "code": 2404, "message": "사용할 수 없는 benefitIdx입니다"},
  CAN_NOT_BLOCK_SELF: {"isSuccess": false, "code": 2405, "message": "자기 자신은 차단할 수 없습니다"},

  //Response
  INVALD_VERIFICATIONCODE: {"isSuccess": false, "code": 3100, "message": "올바르지 않은 인증번호입니다"},
  GET_VERIFICATIONCODE_FIRST: {"isSuccess": false, "code": 3101, "message": "인증번호를 먼저 발급해주세요"},
  INVALID_CODE: {"isSuccess": false, "code": 3102, "message": "유효하지 않은 인증번호입니다"},

  ALREADY_EXISTED_EMAIL: {"isSuccess": false, "code": 3200, "message": "이미 가입한 이메일입니다"},
  DUPLICATED_NICKNAME: {"isSuccess": false, "code": 3201, "message": "중복된 닉네임입니다"},
  ALREADY_REPORTED_IDX: {"isSuccess": false, "code": 3202, "message": "기존에 신고한 글입니다"},
  ALREADY_FINISHED_ABTEST_IDX: {"isSuccess": false, "code": 3203, "message": "이미 마감된 투표입니다"},
  ALREADY_VOTE_ABTEST_IDX: {"isSuccess": false, "code": 3204, "message": "이미 투표 완료한 abTest입니다"},
  ALREADY_PAYMENT_ORDER_IDX: {"isSuccess": false, "code": 3205, "message": "이미 결제한 orderIdx입니다"},
  ALREADY_WRITTEN_COMMENT: {"isSuccess": false, "code": 3206, "message": "이미 댓글을 작성한 orderDetailIdx입니다"},
  ALREADY_BLOCKED_USER_IDX: {"isSuccess": false, "code": 3207, "message": "이미 차단한 userIdx입니다"},

  EMPTY_USER_SEARCH: {"isSuccess": false, "code": 3300, "message": "사용자의 최근 검색어가 없습니다"},
  NO_VOTE_DATA: {"isSuccess": false, "code": 3301, "message": "투표 이력이 없습니다"},
  EMPTY_CRAFT: {"isSuccess": false, "code": 3302, "message": "상품이 없습니다"},

  INVALID_USER_INFO: {"isSuccess": false, "code": 3400, "message": "일치하는 회원 정보가 없습니다"},
  NOT_ENTER_DELIVERY_INFO: {"isSuccess": false, "code": 3401, "message": "발송정보가 입력되지 않았습니다"},

  FORGE_PAYMENT: {"isSuccess": false, "code": 3500, "message": "위조된 요청입니다"},
  INVALID_TINVOICE: {"isSuccess": false, "code": 3501, "message": "유효하지 않은 운송장 번호 혹은 택배사 코드입니다"},
  CAN_NOT_CANCEL_STATUS: {"isSuccess": false, "code": 3502, "message": "주문취소가 불가능합니다"},
  CAN_NOT_CREATE_SENDING_INFO: {"isSuccess": false, "code": 3503, "message": "발송정보 입력이 불가능합니다"},
  CAN_NOT_RETURN_STATUS: {"isSuccess": false, "code": 3504, "message": "반품요청이 불가능합니다"},
  CAN_NOT_RES_RETURN: {"isSuccess": false, "code": 3505, "message": "반품 승인 및 거부가 불가능합니다"},
  CAN_NOT_RES_CANCEL: {"isSuccess": false, "code": 3506, "message": "취소 승인 및 거부가 불가능합니다"},
  IMPOSSIBLE_TO_WRITE_COMMENT_STATUS: {"isSuccess": false, "code": 3507, "message": "댓글 작성이 불가능한 상태입니다"},

  DB_ERROR: {"isSuccess": false, "code": 4000, "message": "DB 에러"},
  SERVER_ERROR: {"isSuccess": false, "code": 4001, "message": "Server 에러"},
}