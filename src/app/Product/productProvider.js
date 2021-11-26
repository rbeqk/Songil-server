const productDao = require('./productDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getProductDetail = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 productIdx인지
      const isExistProductIdx = await productDao.isExistProductIdx(connection, params);
      if (!isExistProductIdx) return errResponse(baseResponse.INVALID_PRODUCT_IDX);

      //상세 정보
      const basicInfo = await productDao.getProductBasicInfo(connection, params);  //기본 정보
      const detailImage = await productDao.getProductDetailImage(connection, params);  //상세 이미지
      const cautions = await productDao.getProductCautions(connection, params);  //유의사항
      const material = await productDao.getProductMaterial(connection, params);  //소재
      const usage = await productDao.getProductUsage(connection, params);  //용도

      const isFreeShippingFee = await productDao.isFreeShippingFee(connection, params);  //조건 없이 전체 무료배송인지
      let shippingFeeList = [];
      
      if (isFreeShippingFee === 'Y'){
        shippingFeeList.push('무료배송');
      }
      else{
        const shippingFee = await productDao.getShippingFeeList(connection, params);
        shippingFeeList = shippingFee.map(item => item.shippingFee);
      }

      const detailImageList = detailImage.map(item => item.detailImageUrl);
      const cautionsList = cautions.map(item => item.cautions);
      const materialList = material.map(item => item.material);
      const usageList = usage.map(item => item.usage);

      let result = {
        'productIdx': basicInfo.productIdx,
        'isNew': basicInfo.isNew,
        'name': basicInfo.name,
        'mainImageUrl': basicInfo.mainImageUrl,
        'price': basicInfo.price,
        'shippingFee': shippingFeeList,
        'material': materialList,
        'usage' : usageList,
        'content': basicInfo.content,
        'size': basicInfo.size,
        'cautions': cautionsList,
        'detailImageUrls': detailImageList,
        'artistIdx': basicInfo.artistIdx,
        'artistName': basicInfo.artistName,
        'artistIntroduction': basicInfo.artistIntroduction,
        'artistImageUrl': basicInfo.artistImageUrl,
        'totalReviewCnt': basicInfo.totalReviewCnt
      };

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getProductDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getProductDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}