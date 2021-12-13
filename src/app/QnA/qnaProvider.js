const qnaDao = require('./qnaDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getQnADetail = async (qnaIdx, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 qna인지
      const isExistQnaIdx = await qnaDao.isExistQnaIdx(connection, qnaIdx);
      if (!isExistQnaIdx) return errResponse(baseResponse.INVALID_QNA_IDX);

      if (!userIdx) userIdx = -1; //존재하지 않는 userIdx로

      const qnaDetail = await qnaDao.getQnADetail(connection, qnaIdx, userIdx);
      
      const result = {
        'userIdx': qnaDetail.userIdx,
        'userProfile': qnaDetail.userProfile,
        'userName': qnaDetail.userName,
        'title': qnaDetail.title,
        'content': qnaDetail.content,
        'createdAt': qnaDetail.createdAt,
        'totalLikeCnt': qnaDetail.totalLikeCnt,
        'isLike': qnaDetail.isLike ? 'Y' : 'N',
        'totalCommentCnt': qnaDetail.totalCommentCnt
      }
      
      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getQnADetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getQnADetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}