const reviewDao = require('./reviewDao');
const shopDao = require('../Shop/shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getReviewTotalPage = async (params) => {
  const productIdx = params[0];
  const onlyPhoto = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 productIdx인지
      const isExistProductIdx = await shopDao.isExistProductIdx(connection, productIdx);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);

      let reviewCnt;
      
      if (onlyPhoto === 'Y'){
        reviewCnt = await reviewDao.getOnlyPhotoReviewCnt(connection, params);
      }
      else if (onlyPhoto === 'N'){
        reviewCnt = await reviewDao.getReviewCnt(connection, params);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (reviewCnt % pageItemCnt == 0) ? reviewCnt / pageItemCnt : parseInt(reviewCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {'totalPages': totalPages};

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getReviewTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getReviewTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}


exports.getReview = async (params) => {
  //params = [productIdx, page, onlyPhoto]
  const productIdx = params[0];
  const page = params[1];
  const onlyPhoto = params[2];

  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 productIdx인지
      const isExistProductIdx = await shopDao.isExistProductIdx(connection, productIdx);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);
      
      let reviewCnt;

      //포토리뷰만
      if (onlyPhoto === 'Y'){
        reviewCnt = await reviewDao.getOnlyPhotoReviewCnt(connection, productIdx);
      }
      //리뷰 전체
      else if (onlyPhoto === 'N'){
        reviewCnt = await reviewDao.getReviewCnt(connection, productIdx);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (reviewCnt % pageItemCnt == 0) ? reviewCnt / pageItemCnt : parseInt(reviewCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지

      let result = {};
      result.totalReviewCnt = reviewCnt;
      result.reviews = [];

      let reviewInfo;
      const startItemIdx = (page - 1) * pageItemCnt;

      //포토리뷰만
      if (onlyPhoto === 'Y'){
        reviewInfo = await reviewDao.getReviewInfoOnlyPhoto(connection, [productIdx, startItemIdx, pageItemCnt]);
      }
      //리뷰 전체
      else if (onlyPhoto === 'N'){
        reviewInfo = await reviewDao.getReviewInfo(connection, [productIdx, startItemIdx, pageItemCnt]);
      }

      let productReviewIdx;
      let reviewPhoto;
      for (let item of reviewInfo){
        productReviewIdx = item.productReviewIdx;
        reviewPhoto = await reviewDao.getReviewPhoto(connection, productReviewIdx);

        //이미지 배열로 변환
        let reviewPhotoList = [];
        for (let photo of reviewPhoto) {
          reviewPhotoList.push(photo.imageUrl);
        }

        result.reviews.push({
          'productReviewIdx': item.productReviewIdx,
          'userIdx': item.userIdx,
          'nickname': item.nickname,
          'createdAt': item.createdAt,
          'imageUrl': !reviewPhotoList.length ? null : reviewPhotoList,
          'content': item.content,
          'isReported': item.isReported
        })
      }

      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getReview DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getReview DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}