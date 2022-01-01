const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getShop = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let result = {};

      const banner = await shopDao.getBanner(connection);
      result.banner = banner.map(item => item.imageUrl);

      const todayCraft = await shopDao.getTodayCraft(connection);
      result.todayCraft = [];
      todayCraft.forEach(item => {
        result.todayCraft.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl,
          'imageUrl': item.imageUrl,
          'name': item.name,
          'artistIdx': item.artistIdx,
          'artistName': item.artistName,
          'price': item.price,
          'isNew': item.isNew,
        })
      });

      const todayArtist = await shopDao.getTodayArtist(connection);
      result.todayArtist = {
        'artistIdx': todayArtist.artistIdx,
        'artistName': todayArtist.artistName,
        'imageUrl': todayArtist.imageUrl,
        'major': todayArtist.major
      }

      const newCraft = await shopDao.getNewCraft(connection);
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
      logger.error(`getShop DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getShop DB Connection Error: ${err}`);
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

//카테고리 별 이번주 인기 상품 조회
//품절 아닌 상품 중 랜덤 15개
exports.getWeeklyPopularCraft = async (categoryIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      let weeklyPopularCraft = [];

      //카테고리 별 인기 상품 가져오기
      if (categoryIdx != 8){
        weeklyPopularCraft = await shopDao.getWeeklyPopularCraftByCategory(connection, categoryIdx);
      }
      //전체 상품에서 인기 상품 가져오기
      else if (categoryIdx == 8){
        weeklyPopularCraft = await shopDao.getWeeklyPopularCraft(connection);
      }

      connection.release();

      let result =  [];

      //상품이 있을 경우
      if (weeklyPopularCraft.length > 0){
        weeklyPopularCraft.forEach(item => {
          result.push({
            'craftIdx': item.craftIdx,
            'mainImageUrl': item.mainImageUrl,
            'name': item.name,
            'artistIdx': item.artistIdx,
            'artistName': item.artistName,
            'price': item.price,
            'isNew': item.isNew
          })
        });

        return response(baseResponse.SUCCESS, result);
      }
      //상품이 없을 경우
      else{
        return errResponse(baseResponse.EMPTY_CRAFT);
      }
      
    }catch(err){
      connection.release();
      logger.error(`getWeeklyPopularCraft DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getWeeklyPopularCraft DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}