const abTestDao = require('./abTestDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getABTestFinalInfo, getUserVoteInfo} = require('../../../modules/abTestUtil');

exports.getABTestDetail = async (abTestIdx, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 abTestIdx인지
      const isExistABTestIdx = await abTestDao.isExistABTestIdx(connection, abTestIdx);
      if (!isExistABTestIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ABTEST_IDX);
      }

      //abTest 기본 정보
      const abTestInfo = await abTestDao.getABTestInfo(connection, abTestIdx);

      let result = {
        'abTestIdx': abTestInfo.abTestIdx,
        'artistIdx': abTestInfo.artistIdx,
        'artistImageUrl': abTestInfo.artistImageUrl,
        'artistName': abTestInfo.artistName,
        'content': abTestInfo.content,
        'imageA': abTestInfo.imageA,
        'imageB': abTestInfo.imageB,
        'deadline': abTestInfo.deadline,
        'totalCommentCnt': abTestInfo.totalCommentCnt,
        'isFinished': abTestInfo.isFinished
      };

      //투표 결과 가져오기
      if (abTestInfo.isFinished === 'Y'){
        const finalInfo = await getABTestFinalInfo(connection, abTestInfo.abTestIdx);
        if (finalInfo === false){
          connection.release();
          return errResponse(baseResponse.DB_ERROR);
        }

        result.finalInfo = finalInfo;
      }
      else{
        result.finalInfo = null;
      }


      //유저의 투표 정보 가져오기
      if (userIdx != -1){
        const voteInfo = await getUserVoteInfo(connection, userIdx, abTestInfo.abTestIdx);
        if (voteInfo === false){
          connection.release();
          return errResponse(baseResponse.DB_ERROR);
        }

        result.voteInfo = voteInfo;
      }
      else{
        result.voteInfo = null;
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getABTestDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getABTestDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}