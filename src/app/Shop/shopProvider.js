const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getShopEtc = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const banner = await shopDao.getBanner(connection);
      const todayArtist = await shopDao.getTodayArtist(connection);
      const newCraft = await shopDao.getNewCraft(connection);

      let result = {};

      result.banner = banner.map(item => item.imageUrl);

      result.todayArtist = {
        'artistIdx': todayArtist.artistIdx,
        'artistName': todayArtist.artistName,
        'imageUrl': todayArtist.imageUrl,
        'major': todayArtist.major
      }

      result.newCraft = [];

      newCraft.forEach(item => {
        result.newCraft.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl
        })
      });

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getShopEtc DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getShopEtc DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getProductByCategoryTotalPage = async (craftCategoryIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const productCnt = await shopDao.getProductByCategory(connection, craftCategoryIdx); //카테고리 별 상품 개수

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (productCnt % pageItemCnt == 0) ? productCnt / pageItemCnt : parseInt(productCnt / pageItemCnt) + 1;  //총 페이지 수
      const result = {
        'totalPages': totalPages
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getProductByCategoryTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getProductByCategoryTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}