const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getTodayCraftTotalPage = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      //현재는 상품 전체 개수와 동일
      const totalCnt = await shopDao.getTodayCraftTotalCnt(connection);

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (totalCnt % pageItemCnt == 0) ? totalCnt / pageItemCnt : parseInt(totalCnt / pageItemCnt) + 1;  //총 페이지 수
      const result = {
        'totalPages': totalPages
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getTodayCraftTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getTodayCraftTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getTodayCraft = async (params) => {
  const page = params[0];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const todayCraftCnt = await shopDao.getTodayCraftTotalCnt(connection);
      const totalPages = (todayCraftCnt % pageItemCnt == 0) ? todayCraftCnt / pageItemCnt : parseInt(todayCraftCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지

      const startItemIdx = (page - 1) * pageItemCnt;

      const todayCraft = await shopDao.getTodayCraft(connection, [startItemIdx, pageItemCnt]);

      let result = [];
      todayCraft.forEach(item => {
        result.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl,
          'name': item.name,
          'artistIdx': item.artistIdx,
          'artistName': item.artistName,
          'price': item.price,
          'isNew': item.isNew
        })
      })

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getTodayCraft DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getTodayCraft DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getShopEtc = async (req, res) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const banner = await shopDao.getBanner(connection);
      const todayArtist = await shopDao.getTodayArtist(connection);
      const newCraft = await shopDao.getNewCraft(connection);

      let result = {};

      result.banner = [];
      banner.forEach(item => {
        result.banner.push({
          'bannerIdx': item.shopBannerIdx,
          'imageUrl': item.imageUrl
        })
      })

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
          'imageUrl': item.mainImageUrl
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
      const productCnt = await shopDao.getProductByCategory(connection, [craftCategoryIdx]); //카테고리 별 상품 개수

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