const myPageDao = require('./myPageDao');
const craftCommentDao = require('../CraftComment/craftCommentDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage} = require('../../../modules/pageUtil');
const {
  MY_PAGE_WRITTEN_CRAFT_COMMENT_PER_PAGE,
  MY_PAGE_WRITTEN_POST_PER_PAGE,
} = require("../../../modules/constants");

exports.getMyCommentTotalPage = async (userIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let totalCnt;

      //작성 가능한 코멘트 페이지 수
      if (type === 'available'){
        //totalCnt = await myPageDao.getTotalAvailableCommentCnt(connection, userIdx); //TODO
        totalCnt = 0;  //임시
      }
      //작성한 코멘트 페이지 수
      else if (type === 'written'){
        totalCnt = await myPageDao.getTotalWrittenCommentCnt(connection, userIdx);
      }

      const totalPages = getTotalPage(totalCnt, MY_PAGE_WRITTEN_CRAFT_COMMENT_PER_PAGE);
      const result = {
        'totalPages': totalPages
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getMyCommentTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getMyCommentTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//내 코멘트 조회
exports.getMyComment = async (userIdx, type, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let result = [];
      const startItemIdx = (page - 1) * MY_PAGE_WRITTEN_CRAFT_COMMENT_PER_PAGE;

      //작성 가능한 코멘트
      if (type === 'available'){
        //TODO
        // const availableComment = await myPageDao.getAvailableComment(connection, userIdx, page, pageItemCnt);

        // for (let item of availableComment){
        //   availableComment.forEach(async item => {
        //     result.push({
        //       'commentIdx': item.commentIdx,
        //       'craftIdx': itme.craftIdx,
        //       'name': item.name,
        //       'mainImageUrl': item.mainImageUrl,
        //       'artistIdx': item.artistIdx,
        //       'artistName': item.artistName
        //     })
        //   });
        // }
      }
      //작성한 코멘트
      else if (type === 'written'){
        const writtenComment = await myPageDao.getWrittenComment(connection, userIdx, startItemIdx, MY_PAGE_WRITTEN_CRAFT_COMMENT_PER_PAGE);
        
        for (let item of writtenComment){
          const imageArr = await craftCommentDao.getCommentPhoto(connection, item.commentIdx);

          result.push({
            'commentIdx': item.commentIdx,
            'craftIdx': item.craftIdx,
            'name': item.name,
            'artistIdx': item.artistIdx,
            'artistName': item.artistName,
            'createdAt': item.createdAt,
            'imageUrl': imageArr ? imageArr.map(item => item.imageUrl) : [],
            'content': item.content
          });
        }
      }

      result.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getMyComment DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getMyComment DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//좋아요한 게시글 페이지(Story && QnA)
exports.getLikePostCnt = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //좋아요한 Story 개수
      const likedStoryCnt = await myPageDao.getLikedStoryCnt(connection, userIdx);

      //좋아요한 QnA 개수
      const likedQnACnt = await myPageDao.getLikedQnACnt(connection, userIdx);

      //좋아요한 게시글 개수
      const totalCnt = likedStoryCnt + likedQnACnt;
      const totalPages = getTotalPage(totalCnt, LIKED_WITH_PER_PAGE);

      const result = {
        'totalPages': totalPages
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getLikePostCnt DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikePostCnt DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

//내가 쓴 글 페이지 개수
exports.getUserWrittenWith = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const artistIdx = await myPageDao.getArtistIdx(connection, userIdx);
      const totalCnt = await myPageDao.getWrittenWithCnt(connection, userIdx, artistIdx);
      const totalPages = getTotalPage(totalCnt, MY_PAGE_WRITTEN_POST_PER_PAGE);

      const result = {
        'totalPages': totalPages
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getUserWrittenWith DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getUserWrittenWith DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}