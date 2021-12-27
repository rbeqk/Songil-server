const myPageDao = require('./myPageDao');
const craftCommentDao = require('../CraftComment/craftCommentDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getMyCommentTotalPage = async (userIdx, type) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      let totalCommentCnt;

      //작성 가능한 코멘트 페이지 수
      if (type === 'available'){
        //totalCommentCnt = await myPageDao.getTotalAvailableCommentCnt(connection, userIdx); //TODO
        totalCommentCnt = 0;  //임시
      }
      //작성한 코멘트 페이지 수
      else if (type === 'written'){
        totalCommentCnt = await myPageDao.getTotalWrittenCommentCnt(connection, userIdx);
      }

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (totalCommentCnt % pageItemCnt == 0) ? totalCommentCnt / pageItemCnt : parseInt(totalCommentCnt / pageItemCnt) + 1;  //총 페이지 수

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
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const startItemIdx = (page - 1) * pageItemCnt;

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
        const writtenComment = await myPageDao.getWrittenComment(connection, userIdx, startItemIdx, pageItemCnt);
        
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
      const likedPostCnt = likedStoryCnt + likedQnACnt;

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (likedPostCnt % pageItemCnt == 0) ? likedPostCnt / pageItemCnt : parseInt(likedPostCnt / pageItemCnt) + 1;  //총 페이지 수

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

//좋아요한 게시글
exports.getLikedPost = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const startItemIdx = (page - 1) * pageItemCnt;

      const likedPost = await myPageDao.getLikedPost(connection, userIdx, startItemIdx, pageItemCnt);

      let result = [];

      likedPost.forEach(item => {
        result.push({
          'qnaIdx': item.qnaIdx,
          'storyIdx': item.storyIdx,
          'imageUrl': item.imageUrl,
          'title': item.title,
          'content': item.content,
          'userIdx': item.userIdx,
          'userName': item.userName,
          'createdAt': item.createdAt,
          'totalLikeCnt': item.totalLikeCnt,
          'totalCommentCnt': item.totalCommentCnt
        })
      });

      result.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getLikedPost DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getLikedPost DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}