const craftCommentDao = require('./craftCommentDao');
const craftDao = require('../Craft/craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getCommentTotalPage = async (craftIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx) return errResponse(baseResponse.INVALID_CRAFT_IDX);

      let commentCnt;
      
      //포토 댓글만
      if (type === 'photo'){
        commentCnt = await craftCommentDao.getOnlyPhotoCommentCnt(connection, craftIdx);
      }
      //댓글 전체
      else if (type === 'all'){
        commentCnt = await craftCommentDao.getCommentCnt(connection, craftIdx);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (commentCnt % pageItemCnt == 0) ? commentCnt / pageItemCnt : parseInt(commentCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {'totalPages': totalPages};

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


exports.getComment = async (craftIdx, page, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx) return errResponse(baseResponse.INVALID_CRAFT_IDX);
      
      let commentCnt;

      //포토댓글만
      if (type === 'photo'){
        commentCnt = await craftCommentDao.getOnlyPhotoCommentCnt(connection, craftIdx);
      }
      //댓글 전체
      else if (type === 'all'){
        commentCnt = await craftCommentDao.getCommentCnt(connection, craftIdx);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수

      let result = {};
      result.totalCommentCnt = commentCnt;
      result.comments = [];

      let commentInfo;
      const startItemIdx = (page - 1) * pageItemCnt;

      if (commentCnt > 0){

        //포토댓글만
        if (type === 'photo'){
          commentInfo = await craftCommentDao.getCommentInfoOnlyPhoto(connection, craftIdx, startItemIdx, pageItemCnt);
        }
        //댓글 전체
        else if (type === 'all'){
          commentInfo = await craftCommentDao.getCommentInfo(connection, craftIdx, startItemIdx, pageItemCnt);
        }

        let commentIdx;
        let commentPhoto;
        for (let item of commentInfo){
          commentIdx = item.commentIdx;
          commentPhoto = await craftCommentDao.getCommentPhoto(connection, commentIdx);

          result.comments.push({
            'commentIdx': item.commentIdx,
            'userIdx': item.userIdx,
            'nickname': item.nickname,
            'createdAt': item.createdAt,
            'imageUrl': commentPhoto ? commentPhoto.map(item => item.imageUrl) : [],
            'content': item.content,
            'isReported': item.isReported
          })
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