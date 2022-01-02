const abTestDao = require('./abTestDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

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

      //해당 ABTest 총 투표 수
      const currentVoteTotalCnt = await abTestDao.getCurrentVoteTotalCnt(connection, abTestIdx);

      //로그인 한 경우
      if (userIdx != -1){

        //유저의 투표 여부 및 투표 이미지 정보
        const userVote = await abTestDao.getUserVote(connection, abTestIdx, userIdx);
        
        //투표 했을 경우
        if (userVote){

          //유저가 투표한 표의 총 투표 수
          const currentUserVoteTotalCnt = await abTestDao.getCurrentUserVoteTotalCnt(connection, abTestIdx, userVote['vote']);

          result.voteInfo = {
            'vote': userVote['vote'],
            'totalVoteCnt': currentUserVoteTotalCnt,
            'percent': parseInt(currentUserVoteTotalCnt / currentVoteTotalCnt * 100)
          };
        }
        //투표 안 했을 경우
        else{
          result.voteInfo = null;
        }
      }
      //로그인 안한 경우
      else{
        result.voteInfo = null;
      }


      //마감 후
      if (abTestInfo.isFinished === 'Y'){
        
        //투표 결과(투표 많은 순)
        const finalInfo = await abTestDao.getFinalVoteInfo(connection, abTestIdx);
        result.finalInfo = {};

        //투표 결과가 있을 경우(두가지 모두 표를 받았을 경우)
        if (finalInfo.length === 2){

          //서로 비겼을 경우
          if (finalInfo[0]['totalCnt'] === finalInfo[1]['totalCnt']){
            result.finalInfo = {
              'vote': 'DRAW',
              'totalVoteCnt': finalInfo[0]['totalCnt'],
              'percent': 50
            };
          }
          else{
            result.finalInfo = {
              'vote': finalInfo[0]['vote'],
              'totalVoteCnt': finalInfo[0]['totalCnt'],
              'percent': parseInt(finalInfo[0]['totalCnt'] / currentVoteTotalCnt * 100)
            };
          }
        }
        //투표 결과가 하나일 경우(몰표)
        else if (finalInfo.length === 1){
          result.finalInfo = {
            'vote': finalInfo[0]['vote'],
            'totalVoteCnt': finalInfo[0]['totalCnt'],
            'percent': 100
          };
        }
        //아무도 투표하지 않았을 경우
        else if (finalInfo.length === 0){
          result.finalInfo = {
            'vote': 'DRAW',
            'totalVoteCnt': 0,
            'percent': 50
          };
        }
      }
      //마감 이전
      else{
        result.finalInfo = null;
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