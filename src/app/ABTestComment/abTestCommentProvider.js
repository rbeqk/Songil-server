const abTestDao = require('../ABTest/abTestDao');
const abTestCommentDao = require('./abTestCommentDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ITEMS_PER_PAGE} = require("../../../modules/constants");

exports.getABTestComment = async (abTestIdx, userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.AB_TEST_COMMENT_PER_PAGE;

      //부모 댓글 가져오기
      const parentComment = await abTestCommentDao.getABTestParentComment(connection, abTestIdx, userIdx, startItemIdx, ITEMS_PER_PAGE.AB_TEST_COMMENT_PER_PAGE);

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
          'reComment': []
        });
      });

      //대댓글 가져오기
      for (let parentComment of result){
        const recommentInfo = await abTestCommentDao.getABTestReComment(connection, abTestIdx, parentComment.commentIdx, userIdx);
        
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
            'isReported': item.isReported
          });
        });
      }

      result = result.filter(item =>
        item.isDeleted === 'N' || (item.isDeleted === 'Y' && item.reComment.length > 0)
      );

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getABTestComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getABTestComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}