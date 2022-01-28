const homeDao = require('./homeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

//home쪽 정보 가져오기
exports.getHome = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let result = {};
      result.article = [];
      result.trendCraft = [];
      result.recommend = [];
      result.talkWith = [];
      result.hotStory = [];

      //상단 아티클 (최신순 4개)
      const articleList = await homeDao.getArticleList(connection);

      articleList.forEach(item => {
        result.article.push({
          'articleIdx': item.articleIdx,
          'categoryIdx': item.categoryIdx,
          'title': item.title,
          'summary': item.summary,
          'mainImageUrl': item.mainImageUrl
        });
      });

      //trendCraft (랜덤 15개 - soldout 제외)
      const trendCraft = await homeDao.getTrendCraft(connection);

      trendCraft.forEach(item => {
        result.trendCraft.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl,
          'name': item.name,
          'artistIdx': item.artistIdx,
          'artistName': item.artistName,
          'isNew': item.isNew
        });
      });
      
      //recommend (랜덤 15개 - soldout 제외)
      const recommend = await homeDao.getRecommend(connection);

      recommend.forEach(item => {
        result.recommend.push({
          'craftIdx': item.craftIdx,
          'mainImageUrl': item.mainImageUrl,
          'name': item.name,
          'artistIdx': item.artistIdx,
          'artistName': item.artistName,
          'price': item.price
        });
      });

      //talk with (15개 / 커뮤니티 쪽 hot talk와 동일 기준)
      const talkWith = await homeDao.getTalkWith(connection);
      
      talkWith.forEach(item => {
        result.talkWith.push({
          'idx': item.idx,
          'categoryIdx': item.categoryIdx,
          'text': item.text
        });
      });

      //hot Story (좋아요 순 6개)
      const hotStory = await homeDao.getHotStory(connection);

      hotStory.forEach(item => {
        result.hotStory.push({
          'storyIdx': item.storyIdx,
          'mainImageUrl': item.mainImageUrl
        });
      });

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