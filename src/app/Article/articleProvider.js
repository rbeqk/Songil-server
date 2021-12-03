const articleDao = require('./articleDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getArticleList = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const articleList = await articleDao.getArticleList(connection, params);
      
      let result = [];

      articleList.forEach(item => {
        result.push({
          'articleIdx': item.articleIdx,
          'articleCategoryIdx': item.articleCategoryIdx,
          'title': item.title,
          'mainImageUrl': item.mainImageUrl,
          'editorIdx': item.editorIdx,
          'editorName': item.editorName
        })
      })
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArticleList DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArticleList DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getArticleDetail = async (params) => {
  const articleIdx = params[0];
  const userIdx = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 articleIdx인지
      const isExistArticleIdx = await articleDao.isExistArticleIdx(connection, [articleIdx]);
      if (!isExistArticleIdx) return errResponse(baseResponse.INVALID_ARTICLE_IDX);
      
      //아티클 기본 정보 가져오기
      const articleDetailInfo = await articleDao.getArticleDetail(connection, [articleIdx, articleIdx]);

      let result = {};

      result.articleCategoryIdx = articleDetailInfo.articleCategoryIdx;
      result.articleIdx = articleDetailInfo.articleIdx;
      result.mainImageUrl = articleDetailInfo.mainImageUrl;
      result.title = articleDetailInfo.title;
      result.editorIdx = articleDetailInfo.editorIdx;
      result.editorName = articleDetailInfo.editorName;
      result.createdAt = articleDetailInfo.createdAt;

      //아티클 전체 내용 가져오기
      result.content = [];

      const text = 1;
      const image = 2;
      const craft = 3;

      //아티클 내용 가져오기
      const articleContent = await articleDao.getArticleContent(connection, [articleIdx]);
      articleContent.forEach(item => {
        result.content.push({
          'index': item.contentIdx,
          'type': text,
          'textData': item.content,
          'imageData': null,
          'craftData': null
        })
      });

      //아티클 상세사진 가져오기
      const articleDetailImage = await articleDao.getArticelDetailImage(connection, [articleIdx]);
      articleDetailImage.forEach(item => {
        result.content.push({
          'index': item.contentIdx,
          'type': image,
          'textData': null,
          'imageData': item.imageUrl,
          'craftData': null
        })
      });

      //아티클 관련 상품 가져오기
      const articleRelatedCraft = await articleDao.getArticleReatedCraft(connection, [articleIdx]);
      articleRelatedCraft.forEach(item => {
        result.content.push({
          'index': item.contentIdx,
          'type': craft,
          'textData': null,
          'imageData': null,
          'craftData': {
            'craftIdx': item.craftIdx,
            'name': item.name,
            'mainImageUrl': item.mainImageUrl,
            'artistName': item.artistName,
            'price': item.price
          }
        })
      });

      result.content.sort((a, b) => {
        if (a.index < b.index) return -1;
        return a.index > b.index ? 1 : 0;
      });

      //아티클 관련 태그 가져오기
      const articleTag = await articleDao.getArticleTag(connection, [articleIdx]);
      result.tag = null;
      if (articleTag.length){
        result.tag = [];
        articleTag.forEach(item => {
          result.tag.push(item.tag);
        })
      }
      
      //연관 아티클 가져오기
      const relatedArticle = await articleDao.getArticleRelatedArticle(connection, [articleIdx]);
      result.relatedArticle = [];
      relatedArticle.forEach(item => {
        result.relatedArticle.push({
          'articleIdx': item.articleIdx,
          'mainImageUrl': item.mainImageUrl,
          'title': item.title,
          'editorIdx': item.editorIdx,
          'editorName': item.editorName
        })
      })

      //아티클 유저 좋아요 여부
      //로그인 했을 경우
      if (userIdx){
        const isLike = await articleDao.getArticleIsLike(connection, params);
        result.isLike = isLike == 0 ? 'N' : 'Y';
      }
      else{
        result.isLike = 'N';
      }

      result.totalLikeCnt = articleDetailInfo.totalLikeCnt;

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getArticleDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getArticleDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}