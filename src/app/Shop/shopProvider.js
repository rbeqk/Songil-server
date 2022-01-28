const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage, pageInfo} = require("../../../modules/pageUtil");
const {CRAFT_BY_CATEGPRY_PER_PAGE} = require("../../../modules/constants");

exports.getShop = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let result = {};

      const banner = await shopDao.getBanner(connection);
      result.banner = banner;

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

exports.getCraftByCategoryTotalPage = async (craftCategoryIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      let totalCnt = 0;

      //카테고리 별 상품 개수 가져오기
      if (craftCategoryIdx != 8){
        totalCnt = await shopDao.getCraftByCategoryCnt(connection, craftCategoryIdx);
      }
      //전체 상품 개수 가져오기
      else if (craftCategoryIdx == 8){
        totalCnt = await shopDao.getTotalCraftCnt(connection);
      }

      const totalPages = getTotalPage(totalCnt, CRAFT_BY_CATEGPRY_PER_PAGE);
      const result = new pageInfo(totalPages, CRAFT_BY_CATEGPRY_PER_PAGE);

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getCraftByCategoryTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCraftByCategoryTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//카테고리 별 상품 조회
exports.getCraftByCategory = async (userIdx, craftCategoryIdx, page, sort) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      let totalCnt = 0;
      let crafts = [];
      const startItemIdx = (page-1) * CRAFT_BY_CATEGPRY_PER_PAGE;

      //카테고리 별 상품 가져오기
      if (craftCategoryIdx != 8){
        totalCnt = await shopDao.getCraftByCategoryCnt(connection, craftCategoryIdx);
        crafts = await shopDao.getCraftByCategory(connection, userIdx, craftCategoryIdx, startItemIdx, CRAFT_BY_CATEGPRY_PER_PAGE, sort);
      }
      //전체 상품 가져오기
      else if (craftCategoryIdx == 8){
        totalCnt = await shopDao.getTotalCraftCnt(connection);
        crafts = await shopDao.getAllCraft(connection, userIdx, startItemIdx, CRAFT_BY_CATEGPRY_PER_PAGE, sort);
      }

      const result = {
        'totalCnt': totalCnt,
        'crafts': crafts
      }

      result.crafts.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getCraftByCategory DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getCraftByCategory DB Connection Error: ${err}`);
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

      let result =  [];

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

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
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