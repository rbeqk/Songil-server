const reviewDao = require('./reviewDao');
const productDao = require('../Product/productDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getCommentTotalPage = async (params) => {
  const craftIdx = params[0];
  const onlyPhoto = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await productDao.isExistCraftIdx(connection, [craftIdx]);
      if (!isExistCraftIdx) return errResponse(baseResponse.INVALID_CRAFT_IDX);

      let commentCnt;
      
      if (onlyPhoto === 'Y'){
        commentCnt = await reviewDao.getOnlyPhotoCommentCnt(connection, params);
      }
      else if (onlyPhoto === 'N'){
        commentCnt = await reviewDao.getCommentCnt(connection, params);
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


exports.getComment = async (params) => {
  //params = [productIdx, page, onlyPhoto]
  const productIdx = params[0];
  const page = params[1];
  const onlyPhoto = params[2];

  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 craftIdx인지
      const isExistCraftIdx = await productDao.isExistCraftIdx(connection, productIdx);
      if (!isExistCraftIdx) return errResponse(baseResponse.INVALID_CRAFT_IDX);
      
      let commentCnt;

      //포토댓글만
      if (onlyPhoto === 'Y'){
        commentCnt = await reviewDao.getOnlyPhotoCommentCnt(connection, productIdx);
      }
      //리뷰 전체
      else if (onlyPhoto === 'N'){
        commentCnt = await reviewDao.getCommentCnt(connection, productIdx);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (commentCnt % pageItemCnt == 0) ? commentCnt / pageItemCnt : parseInt(commentCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지

      let result = {};
      result.totalCommentCnt = commentCnt;
      result.comments = [];

      let commentInfo;
      const startItemIdx = (page - 1) * pageItemCnt;

      //포토댓글만
      if (onlyPhoto === 'Y'){
        commentInfo = await reviewDao.getCommentInfoOnlyPhoto(connection, [productIdx, startItemIdx, pageItemCnt]);
      }
      //댓글 전체
      else if (onlyPhoto === 'N'){
        commentInfo = await reviewDao.getCommentInfo(connection, [productIdx, startItemIdx, pageItemCnt]);
      }

      let commentIdx;
      let commentPhoto;
      for (let item of commentInfo){
        commentIdx = item.commentIdx;
        commentPhoto = await reviewDao.getCommentPhoto(connection, commentIdx);

        //이미지 배열로 변환
        let commentPhotoList = [];
        for (let photo of commentPhoto) {
          commentPhotoList.push(photo.imageUrl);
        }

        result.comments.push({
          'commentIdx': item.commentIdx,
          'userIdx': item.userIdx,
          'nickname': item.nickname,
          'createdAt': item.createdAt,
          'imageUrl': !commentPhotoList.length ? null : commentPhotoList,
          'content': item.content,
          'isReported': item.isReported
        })
      }
      
      result.comments.reverse();
      
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