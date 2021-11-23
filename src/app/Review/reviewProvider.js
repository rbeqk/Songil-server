const reviewDao = require('./reviewDao');
const shopDao = require('../Shop/shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getReviewTotalPage = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 productIdx인지
      const isExistProductIdx = await shopDao.isExistProductIdx(connection, params);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const reviewCnt = await reviewDao.getReviewCnt(connection, params); //존재하는 리뷰 개수
      const totalPages = (reviewCnt % pageItemCnt == 0) ? reviewCnt / pageItemCnt : parseInt(reviewCnt / pageItemCnt) + 1;

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

      //존재하는 page인지
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const reviewCnt = await reviewDao.getReviewCnt(connection, productIdx); //존재하는 리뷰 개수
      const totalPages = (reviewCnt % pageItemCnt == 0) ? reviewCnt / pageItemCnt : parseInt(reviewCnt / pageItemCnt) + 1;

      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);

      let result = {};
      result.totalReviewCnt = reviewCnt;
      result.reviews = [];

      //리뷰 정보 전체 가져오기
      const reviewInfo = await reviewDao.getReviewInfo(connection, productIdx);

      let productReviewIdx;
      let reviewPhoto;
      for (let item of reviewInfo){
        productReviewIdx = item.productReviewIdx;
        //리뷰 별 사진 가져오기
        reviewPhoto = await reviewDao.getReviewPhoto(connection, productReviewIdx);

        //이미지 배열로 변환
        let reviewPhotoList = [];
        for (let photo of reviewPhoto) {
          reviewPhotoList.push(photo.imageUrl);
        }

        result.reviews.push({
          'reviewIdx': item.reviewIdx,
          'userIdx': item.userIdx,
          'nickname': item.nickname,
          'createdAt': item.createdAt,
          'imageUrl': !reviewPhotoList.length ? null : reviewPhotoList,
          'content': item.content,
          'isReported': item.isReported
        })
      }

      //포토리뷰만 볼 때
      if (onlyPhoto === 'Y'){
        result.reviews = result.reviews.filter(item => item.imageUrl)
      }

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