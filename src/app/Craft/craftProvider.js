const craftDao = require('./craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getCraftDetail = async (userIdx, craftIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 craftIdx인지
      const isExistCraftIdx = await craftDao.isExistCraftIdx(connection, craftIdx);
      if (!isExistCraftIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_CRAFT_IDX);
      }

      //상세 정보
      const basicInfo = await craftDao.getCraftBasicInfo(connection, craftIdx);  //기본 정보
      const detailImage = await craftDao.getCraftDetailImage(connection, craftIdx);  //상세 이미지
      const cautions = await craftDao.getCraftCautions(connection, craftIdx);  //유의사항
      const material = await craftDao.getCraftMaterial(connection, craftIdx);  //소재
      const usage = await craftDao.getCraftUsage(connection, craftIdx);  //용도
      const shippingFee = await craftDao.getCraftShippingFee(connection, craftIdx);
      const refundInfo = await craftDao.getCraftRefundInfo(connection, craftIdx);
      const deliveryPeriodInfo = await craftDao.getDeliveryPeriodInfo(connection, craftIdx);

      let result = {
        'craftIdx': basicInfo.craftIdx,
        'isNew': basicInfo.isNew,
        'isSoldOut': basicInfo.isSoldOut,
        'name': basicInfo.name,
        'mainImageUrl': basicInfo.mainImageUrl,
        'price': basicInfo.price,
        'shippingFee': [shippingFee.basicShippingFee, shippingFee.toFreeShippingFee, shippingFee.extraShippingFee],
        'material': material,
        'usage' : usage,
        'content': basicInfo.content,
        'size': basicInfo.size,
        'cautions': cautions,
        'detailImageUrls': detailImage,
        refundInfo,
        deliveryPeriodInfo,
        'artistIdx': basicInfo.artistIdx,
        'artistName': basicInfo.artistName,
        'artistIntroduction': basicInfo.artistIntroduction,
        'artistImageUrl': basicInfo.artistImageUrl,
        'totalCommentCnt': basicInfo.totalCommentCnt,
        'isLike': userIdx == -1 ? 'N' : await craftDao.getUserLikeCraft(connection, userIdx, craftIdx)
      };

      connection.release();

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