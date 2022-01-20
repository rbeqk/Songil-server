const craftDao = require('./craftDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getCraftDetail = async (craftIdx) => {
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

      const detailImageList = detailImage.map(item => item.detailImageUrl);
      const cautionsList = cautions.map(item => item.cautions);
      const materialList = material.map(item => item.material);
      const usageList = usage.map(item => item.usage);

      let result = {
        'craftIdx': basicInfo.craftIdx,
        'isNew': basicInfo.isNew,
        'isSoldOut': basicInfo.isSoldOut,
        'name': basicInfo.name,
        'mainImageUrl': basicInfo.mainImageUrl,
        'price': basicInfo.price,
        'shippingFee': [shippingFee.basicShippingFee, shippingFee.toFreeShippingFee, shippingFee.extraShippingFee],
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
        'totalCommentCnt': basicInfo.totalCommentCnt
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