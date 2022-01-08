const artistPlaceDao = require('./artistPlaceDao');
const likeDao = require('../Like/likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage} = require("../../../modules/pageUtil");
const {
  ARTIST_PLACE_ARTIST_CRAFT_PER_PAGE,
  ARTIST_PLACE_ARTIST_ARTICLE_PER_PAGE
} = require("../../../modules/constants");

//총 아티클 수 가져오기
const getTotalArticleCnt = async (connection, artistIdx) => {
  try{
    const artistName = await artistPlaceDao.getArtistName(connection, artistIdx);

    //태그에 작가이름이 들어가있는 아티클 목록
    const articleWithArtistTag = await artistPlaceDao.getArticleWithArtistTag(connection, artistName);
  
    //작가 상품이 들어가있는 아티클 목록
    const articleWithArtistCraft = await artistPlaceDao.getArticleWithArtistCraft(connection, artistIdx);
  
    let articleList = [];
  
    if (articleWithArtistTag?.length){
      articleWithArtistTag.forEach(item => {
        articleList.push(item.articleIdx);
      });
    }
  
    if (articleWithArtistCraft?.length){
      articleWithArtistCraft.forEach(item => {
        articleList.push(item.articleIdx);
      });
    }
  
    articleList = [...new Set(articleList)];  //작가 관련 아티클 목록
  
    return articleList.length;

  }catch(err){
    logger.error(`getTotalArticleCnt DB Query Error: ${err}`);
    return false;
  }
}

exports.getArtistInfo = async (artistIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, artistIdx);
      if (!isExistArtistIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ARTIST_IDX);
      }

      //작가 기본 정보 가져오기
      const artistInfo = await artistPlaceDao.getArtistInfo(connection, artistIdx);

      let result = {
        'artistIdx': artistInfo.artistIdx,
        'name': artistInfo.name,
        'imageUrl': artistInfo.imageUrl,
        'introduction': artistInfo.introduction,
        'company': artistInfo.company,
        'major': artistInfo.major,
      };

      //작가 약력 가져오기
      const artistProfile = await artistPlaceDao.getArtistProfile(connection, artistIdx);
      result.profile = artistProfile ? artistProfile.map(item => item.content) : [];

      //작가 전시정보 가져오기
      const artistExhibition = await artistPlaceDao.getArtistExhibition(connection, artistIdx);
      result.exhibition = artistExhibition ? artistExhibition.map(item => item.content) : [];

      //총 상품 개수 가져오기
      const totalCraftCnt = await artistPlaceDao.getArtistCraftCnt(connection, artistIdx);
      result.totalCraftCnt = totalCraftCnt;

      //총 아티클 개수 가져오기
      const totalArticleCnt = await getTotalArticleCnt(connection, artistIdx);
      if (totalArticleCnt === false){
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
      }

      result.totalArticleCnt = totalArticleCnt;
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArtistInfo DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArtistInfo DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getArtistCraftTotalPage = async (artistIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, artistIdx);
      if (!isExistArtistIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ARTIST_IDX);
      }

      const totalCnt = await artistPlaceDao.getArtistCraftCnt(connection, artistIdx);
      const totalPages = getTotalPage(totalCnt, ARTIST_PLACE_ARTIST_CRAFT_PER_PAGE);
      
      const result = {
        'totalPages': totalPages
      };
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArtistCraftTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArtistCraftTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getArtistCraft = async (artistIdx, page, sort, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, artistIdx);
      if (!isExistArtistIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ARTIST_IDX);
      }

      //작가의 총 craft 개수
      const totalCraftCnt = await artistPlaceDao.getArtistCraftCnt(connection, artistIdx);
      const startItemIdx = (page - 1) * ARTIST_PLACE_ARTIST_CRAFT_PER_PAGE;

      //작가의 craft 가져오기
      //sort popular: 인기순 / new: 최신순 / comment: 댓글많은순 / price: 가격낮은순
      const artistCraft = (totalCraftCnt !== 0) ? await artistPlaceDao.getArtistCraft(connection, artistIdx, sort, startItemIdx, ARTIST_PLACE_ARTIST_CRAFT_PER_PAGE) : [];

      let result = {};
      result.totalCraftCnt = totalCraftCnt;
      result.craft = [];

      if (artistCraft.length > 0){
        for (item of artistCraft){
          result.craft.push({
            'craftIdx': item.craftIdx,
            'mainImageUrl': item.mainImageUrl,
            'name': item.name,
            'artistIdx': item.artistIdx,
            'artistName': item.artistName,
            'price': item.price,
            'isNew': item.isNew,
            'isSoldOut': item.isSoldOut,
            'totalLikeCnt': item.totalLikeCnt,
            'isLike': (userIdx != -1) ? 'N' : (await likeDao.craftIsLike(connection, userIdx, item.craftIdx) ? 'Y': 'N'),
            'totalCommentCnt': item.totalCommentCnt
          });
        }
      }

      result.craft.reverse();
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArtistCraft DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArtistCraft DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getArtistArticleTotalPage = async (artistIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가 idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, artistIdx);
      if (!isExistArtistIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ARTIST_IDX);
      }

      //총 아티클 개수 가져오기
      const totalCnt = await getTotalArticleCnt(connection, artistIdx);
      if (totalCnt === false) {
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
      }

      const totalPages = getTotalPage(totalCnt, ARTIST_PLACE_ARTIST_ARTICLE_PER_PAGE);
      const result = {
        'totalPages': totalPages
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArtistArticleTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArtistArticleTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getArtistArticle = async (artistIdx, page, sort, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가 idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, artistIdx);
      if (!isExistArtistIdx) {
        connection.release();
        return errResponse(baseResponse.INVALID_ARTIST_IDX);
      }

      //작가 이름
      const artistName = await artistPlaceDao.getArtistName(connection, artistIdx);

      //태그에 작가이름이 들어가있는 아티클 목록
      const articleWithArtistTag = await artistPlaceDao.getArticleWithArtistTag(connection, artistName);

      //작가 상품이 들어가있는 아티클 목록
      const articleWithArtistCraft = await artistPlaceDao.getArticleWithArtistCraft(connection, artistIdx);

      let articleList = [];
      
      if (articleWithArtistTag?.length){
        articleWithArtistTag.forEach(item => {
          articleList.push(item.articleIdx);
        });
      }
    
      if (articleWithArtistCraft?.length){
        articleWithArtistCraft.forEach(item => {
          articleList.push(item.articleIdx);
        });
      }

      articleList = [...new Set(articleList)];  //작가 관련 아티클 목록

      const totalArticleCnt = articleList.length;
      const startItemIdx = (page - 1) * ARTIST_PLACE_ARTIST_ARTICLE_PER_PAGE;

      let result = {};
      result.totalArticleCnt = totalArticleCnt;

      //작가의 article 가져오기
      //sort popular: 인기순 / new: 최신순
      const artistArticle = (totalArticleCnt !== 0) ? await artistPlaceDao.getArtistArticle(connection, articleList, sort, startItemIdx, ARTIST_PLACE_ARTIST_ARTICLE_PER_PAGE) : [];

      result.article = [];

      if (artistArticle.length > 0){
        for (item of artistArticle){
          result.article.push({
            'articleIdx': item.articleIdx,
            'title': item.title,
            'mainImageUrl': item.mainImageUrl,
            'editorIdx': item.editorIdx,
            'editorName': item.editorName,
            'createdAt': item.createdAt,
            'totalLikeCnt': item.totalLikeCnt,
            'isLike': (userIdx != -1) ? 'N' : (await likeDao.articleLikeStatus(connection, userIdx, item.articleIdx) === 1 ? 'Y' : 'N')
          });
        }
      }

      result.article.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArtistArticle DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArtistArticle DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}