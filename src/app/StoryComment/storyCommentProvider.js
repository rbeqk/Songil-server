const storyDao = require('../Story/storyDao');
const withDao = require('../With/withDao');
const storyCommentDao = require('./storyCommentDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ITEMS_PER_PAGE} = require("../../../modules/constants");
const {isBlockedComment} = require("../../../modules/commentUtil");

//스토리 댓글 조회
exports.getStoryComment = async (storyIdx, userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 storyIdx인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_IDX);
      }

      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.STORY_COMMENT_PER_PAGE;
      const blockUsers = await withDao.getBlockUsers(connection, userIdx);

      //부모 댓글 가져오기
      const parentComment = await storyCommentDao.getStoryParentComment(
        connection, storyIdx, userIdx, startItemIdx, ITEMS_PER_PAGE.STORY_COMMENT_PER_PAGE
      );

      let result = [];

      parentComment.forEach(item => {
        result.push({
          'commentIdx': item.commentIdx,
          'userIdx': item.userIdx,
          'userProfile': item.userProfile,
          'userName': item.userName,
          'isWriter': item.isWriter,
          'comment': item.comment,
          'createdAt': item.createdAt,
          'isUserComment': item.isUserComment,
          'isDeleted': item.isDeleted,
          'isReported': item.isReported,
          'isBlocked': isBlockedComment(item.userIdx, blockUsers),
          'reComment': []
        });
      });

      //대댓글 가져오기
      for (let parentComment of result){
        const recommentInfo = await storyCommentDao.getStoryReComment(connection, parentComment.commentIdx, userIdx);
        
        recommentInfo.forEach(item => {
          parentComment.reComment.push({
            'commentIdx': item.commentIdx,
            'userIdx': item.userIdx,
            'userProfile': item.userProfile,
            'userName': item.userName,
            'isWriter': item.isWriter,
            'comment': item.comment,
            'createdAt': item.createdAt,
            'isUserComment': item.isUserComment,
            'isReported': item.isReported,
            'isBlocked': isBlockedComment(item.userIdx, blockUsers),
          });
        });
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getStoryComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getStoryComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}