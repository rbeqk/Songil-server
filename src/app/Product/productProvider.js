const productDao = require('./productDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getCraftDetail = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 craftIdx인지
      const isExistCraftIdx = await productDao.isExistCraftIdx(connection, params);
      if (!isExistCraftIdx) return errResponse(baseResponse.INVALID_CRAFT_IDX);

      //상세 정보
      const basicInfo = await productDao.getCraftBasicInfo(connection, params);  //기본 정보
      const detailImage = await productDao.getCraftDetailImage(connection, params);  //상세 이미지
      const cautions = await productDao.getCraftCautions(connection, params);  //유의사항
      const material = await productDao.getCraftMaterial(connection, params);  //소재
      const usage = await productDao.getCraftUsage(connection, params);  //용도

      const isFreeShippingFee = await productDao.isFreeShippingFee(connection, params);  //조건 없이 전체 무료배송인지
      let shippingFeeList = [];
      
      if (isFreeShippingFee === 'Y'){
        shippingFeeList.push('무료배송');
      }
      else{
        
        //다른 경우의 수 있을 때 변경 예정
        const shippingFee = await productDao.getShippingFeeList(connection, params);
        shippingFeeList = shippingFee.map(item => item.shippingFee);
      }

      const detailImageList = detailImage.map(item => item.detailImageUrl);
      const cautionsList = cautions.map(item => item.cautions);
      const materialList = material.map(item => item.material);
      const usageList = usage.map(item => item.usage);

      let result = {
        'craftIdx': basicInfo.craftIdx,
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
      logger.error(`getCraftDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCraftDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}