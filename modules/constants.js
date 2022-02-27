const ITEMS_PER_PAGE = {
  ARTIST_ASK_ASK_PER_PAGE: 5,
  ARTIST_PLACE_ARTIST_CRAFT_PER_PAGE: 5,
  ARTIST_PLACE_ARTIST_ARTICLE_PER_PAGE: 5,
  USER_ASK_PER_PAGE: 5,
  CRAFT_COMMENT_PER_PAGE: 5,
  LIKED_ARTICLE_PER_PAGE: 5,
  LIKED_CRAFT_PER_PAGE: 5,
  MY_PAGE_WRITTEN_CRAFT_COMMENT_PER_PAGE: 5,
  MY_PAGE_WRITTEN_POST_PER_PAGE: 5,
  LIKED_WITH_PER_PAGE: 5,
  QNA_COMMENT_PER_PAGE: 5,
  CRAFT_BY_CATEGPRY_PER_PAGE: 5,
  STORY_COMMENT_PER_PAGE: 5,
  AB_TEST_COMMENT_PER_PAGE: 5,
  WITH_BY_CATEGORY_PER_PAGE: 10,
  MY_PAGE_WRITTEN_POST_COMMENT_PER_PAGE: 5,
  MY_PAGE_ORDER_LIST_PER_PAGE: 5,
  ARTIST_PAGE_ORDER_LIST_PER_PAGE: 5,
  ARTIST_PAGE_CANCEL_OR_RETURN_LIST_PER_PAGE: 5,
  SEARCH_PER_PAGE: 5
};

const CATEGORY= {
  STORY: 1,
  QNA: 2,
  ABTEST: 3,
  CRAFT: 4
};

const POINT_INFO = {
  USED_POINT_WHEN_PAYING: 1,
  SAVED_POINT_BY_PAYING: 2,
  SAVED_POINT_BY_REVIEWING: 3,
  RETURNED_POINT_BY_CANCEL: 4,
  RETURNED_POINT_BY_RETURN: 5,
  POINT_BY_SERVICE: 6
};

const ORDER_STATUS = {
  READY_FOR_DELIVERY: 1,
  BEING_DELIVERIED: 2,
  DELIVERY_COMPLETED: 3,
  REQUEST_CANCEL: 4,
  CALCEL_COMPLETED: 5,
  REQUEST_RETURN: 6,
  RETURN_COMPLELTED: 7
};

const DELIVERY_STATUS = {
  BEFORE_DELIVERY: 1,
  BEING_DELIVERIED: 2,
  DELIVERY_COMPLETED: 3
};

const RES_STATUS = {
  APPROVAL: 1,
  REJECTION: 2
};

const ORDER_CANCEL_REASON = {
  CHANGE_OF_HEART: 1,
  OPTION_MISTAKE: 2,
  GUIDE_FROM_ARTIST: 3,
  PLAN_TO_REORDER: 4,
  ETC_REASON: 5
};

const ORDER_RETURN_REASON = {
  CHANGE_OF_HEART: 1,
  DAMAGED_DURING_DELIVERY: 2,
  GUIDE_FROM_ARTIST: 3,
  ETC_REASON: 4
};

const ORDER_CANCEL_RETURN_STATUS = {
  REQUEST_CANCEL: 1,
  REQUEST_RETURN: 2,
  COMPLETED: 3
};

module.exports = {
  ITEMS_PER_PAGE,
  CATEGORY,
  POINT_INFO,
  ORDER_STATUS,
  DELIVERY_STATUS,
  RES_STATUS,
  ORDER_CANCEL_REASON,
  ORDER_RETURN_REASON,
  ORDER_CANCEL_RETURN_STATUS,
}