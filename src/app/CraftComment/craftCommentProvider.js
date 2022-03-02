const craftCommentDao = require('./craftCommentDao');
const craftDao = require('../Craft/craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage, pageInfo} = require("../../../modules/pageUtil");
const {ITEMS_PER_PAGE} = require("../../../modules/constants");

//상품 댓글 페이지 개수 조회
exports.getCommentTotalPage = async (craftIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      let totalCnt;
      
      //포토 댓글만
      if (type === 'photo'){
        totalCnt = await craftCommentDao.getOnlyPhotoCommentCnt(connection, craftIdx);
      }
      //댓글 전체
      else if (type === 'all'){
        totalCnt = await craftCommentDao.getCommentCnt(connection, craftIdx);
      }

      const totalPages = getTotalPage(totalCnt, ITEMS_PER_PAGE.CRAFT_COMMENT_PER_PAGE);
      const result = new pageInfo(totalPages, ITEMS_PER_PAGE.CRAFT_COMMENT_PER_PAGE);

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getCommentTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCommentTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//상품 댓글 조회
exports.getComment = async (craftIdx, page, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }
      
      let commentCnt;

      //포토댓글만
      if (type === 'photo'){
        commentCnt = await craftCommentDao.getOnlyPhotoCommentCnt(connection, craftIdx);
      }
      //댓글 전체
      else if (type === 'all'){
        commentCnt = await craftCommentDao.getCommentCnt(connection, craftIdx);
      }

      let result = {};
      result.totalCommentCnt = commentCnt;
      result.comments = [];

      let commentInfo;
      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.CRAFT_COMMENT_PER_PAGE;

      if (commentCnt > 0){

        //포토댓글만
        if (type === 'photo'){
          commentInfo = await craftCommentDao.getCommentInfoOnlyPhoto(
            connection, craftIdx, startItemIdx, ITEMS_PER_PAGE.CRAFT_COMMENT_PER_PAGE
          );
        }
        //댓글 전체
        else if (type === 'all'){
          commentInfo = await craftCommentDao.getCommentInfo(
            connection, craftIdx, startItemIdx, ITEMS_PER_PAGE.CRAFT_COMMENT_PER_PAGE
          );
        }

        for (let item of commentInfo){
          result.comments.push({
            'commentIdx': item.commentIdx,
            'userIdx': item.userIdx,
            'nickname': item.nickname,
            'createdAt': item.createdAt,
            'imageUrl': await craftCommentDao.getCommentImageUrlArr(connection, item.commentIdx),
            'content': item.content,
            'isReported': item.isReported
          });
        }
        
        result.comments.reverse();
      }
      
      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}