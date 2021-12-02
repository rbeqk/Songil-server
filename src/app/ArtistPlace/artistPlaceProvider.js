const artistPlaceDao = require('./artistPlaceDao');
const productDao = require('../Product/productDao');
const articleDao = require('../Article/articleDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getArtistInfo = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, params);
      if (!isExistArtistIdx) return errResponse(baseResponse.INVALID_ARTIST_IDX);

      //작가 기본 정보 가져오기
      const artistInfo = await artistPlaceDao.getArtistInfo(connection, params);

      let result = {
        'artistIdx': artistInfo.artistIdx,
        'name': artistInfo.name,
        'imageUrl': artistInfo.imageUrl,
        'introduction': artistInfo.introduction,
        'company': artistInfo.company,
        'major': artistInfo.major,
      };

      //작가 약력 가져오기
      const artistProfile = await artistPlaceDao.getArtistProfile(connection, params);
      result.profile = [];
      artistProfile.forEach(item => {
        result.profile.push(item.content);
      })

      //작가 전시정보 가져오기
      const artistExhibition = await artistPlaceDao.getArtistExhibition(connection, params);
      result.exhibition = [];
      artistExhibition.forEach(item => {
        result.exhibition.push(item.content);
      })
      
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

exports.getArtistCraftTotalPage = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, params);
      if (!isExistArtistIdx) return errResponse(baseResponse.INVALID_ARTIST_IDX);

      const craftCnt = await artistPlaceDao.getArtistCraftCnt(connection, params);
      
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (craftCnt % pageItemCnt == 0) ? craftCnt / pageItemCnt : parseInt(craftCnt / pageItemCnt) + 1;  //총 페이지 수
      
      const result = {'totalPages': totalPages};
      
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

exports.getArtistCraft = async (params) => {
  const artistIdx = params[0];
  const page = params[1];
  const filter = params[2];
  const userIdx = params[3];

  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, [artistIdx]);
      if (!isExistArtistIdx) return errResponse(baseResponse.INVALID_ARTIST_IDX);

      const craftCnt = await artistPlaceDao.getArtistCraftCnt(connection, params);
      
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (craftCnt % pageItemCnt == 0) ? craftCnt / pageItemCnt : parseInt(craftCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지
      
      const startItemIdx = (page - 1) * pageItemCnt;

      //작가의 craft 가져오기
      //filter popular: 인기순 / new: 최신순 / review: 리뷰많은순 / price: 가격낮은순
      const artistCraft = await artistPlaceDao.getArtistCraft(connection, [artistIdx, filter, filter, filter, filter, startItemIdx, pageItemCnt]);

      let result = {};
      result.totalCraftCnt = artistCraft.length;
      result.product = null;

      if (artistCraft.length){
        result.product = [];
        for (item of artistCraft){
          const isLike = await productDao.getUserLikeProduct(connection, [item.productIdx, userIdx]);
          result.product.push({
            'productIdx': item.productIdx,
            'mainImageUrl': item.mainImageUrl,
            'name': item.name,
            'artistIdx': item.artistIdx,
            'artistName': item.artistName,
            'price': item.price,
            'isNew': item.isNew,
            'totalLikeCnt': item.totalLikeCnt,
            'isLike': !userIdx ? 'N' : (isLike ? 'Y': 'N'),
            'totalReviewCnt': item.totalReviewCnt
          });
        }
      }

      result.product.reverse();

      //총 작가의 아티클 개수 가져오기
      //작가 이름
      const artistName = await artistPlaceDao.getArtistName(connection, params);

      //태그에 작가이름이 들어가있는 아티클 목록
      const articleWithArtistTag = await artistPlaceDao.getArticleWithArtistTag(connection, [artistName]);

      //작가 상품이 들어가있는 아티클 목록
      const articleWithArtistProduct = await artistPlaceDao.getArticleWithArtistProduct(connection, params);

      let articleList = [];
      articleWithArtistTag.forEach(item => {
        articleList.push(item.articleIdx);
      });

      articleWithArtistProduct.forEach(item => {
        articleList.push(item.articleIdx);
      });

      articleList = [...new Set(articleList)];  //작가 관련 아티클 목록

      const articleCnt = articleList.length;  //총 아티클 개수

      result.totalArticleCnt = articleCnt;
      
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

exports.getArtistCraftTotalPage = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가 idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, params);
      if (!isExistArtistIdx) return errResponse(baseResponse.INVALID_ARTIST_IDX);

      //작가 이름
      const artistName = await artistPlaceDao.getArtistName(connection, params);

      //태그에 작가이름이 들어가있는 아티클 목록
      const articleWithArtistTag = await artistPlaceDao.getArticleWithArtistTag(connection, [artistName]);

      //작가 상품이 들어가있는 아티클 목록
      const articleWithArtistProduct = await artistPlaceDao.getArticleWithArtistProduct(connection, params);

      let articleList = [];
      articleWithArtistTag.forEach(item => {
        articleList.push(item.articleIdx);
      });

      articleWithArtistProduct.forEach(item => {
        articleList.push(item.articleIdx);
      });

      articleList = [...new Set(articleList)];  //작가 관련 아티클 목록

      const articleCnt = articleList.length;  //총 아티클 개수

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (articleCnt % pageItemCnt == 0) ? articleCnt / pageItemCnt : parseInt(articleCnt / pageItemCnt) + 1;  //총 페이지 수

      const result = {'totalPages': totalPages};

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

exports.getArtistArticle = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 작가 idx인지
      const isExistArtistIdx = await artistPlaceDao.isExistArtistIdx(connection, params);
      if (!isExistArtistIdx) return errResponse(baseResponse.INVALID_ARTIST_IDX);

       //작가 이름
      const artistName = await artistPlaceDao.getArtistName(connection, params);

      //태그에 작가이름이 들어가있는 아티클 목록
      const articleWithArtistTag = await artistPlaceDao.getArticleWithArtistTag(connection, [artistName]);

      //작가 상품이 들어가있는 아티클 목록
      const articleWithArtistProduct = await artistPlaceDao.getArticleWithArtistProduct(connection, params);

      let articleList = [];
      articleWithArtistTag.forEach(item => {
        articleList.push(item.articleIdx);
      });

      articleWithArtistProduct.forEach(item => {
        articleList.push(item.articleIdx);
      });

      articleList = [...new Set(articleList)];  //작가 관련 아티클 목록

      let result = {};
      result.totalArticleCnt = articleList.length;

      result.article = null;

      if (articleList.length){
        result.article = [];
        for (let articleIdx of articleList){
          const articleInfo = await articleDao.getArticleDetail(connection, articleIdx);
          result.article.push({
            'articleIdx': articleInfo.articleIdx,
            'title': articleInfo.title,
            'mainImageUrl': articleInfo.mainImageUrl,
            'editorIdx': articleInfo.editorIdx,
            'editorName': articleInfo.editorName,
            'createdAt': articleInfo.createdAt,
            //총 좋아요 개수, 페이지 처리, 필터 처리
          })
        }
      }

      //총 상품 개수 추가

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