const abTestDao = require('../src/app/ABTest/abTestDao');
const {logger} = require('../config/winston');

//투표 최종 결과 가져오기
const getABTestFinalInfo = async (connection, abTestIdx) => {
  try{
    let result = null;

    const finalInfo = await abTestDao.getFinalVoteInfo(connection, abTestIdx);

    //두개 모두 표를 받았을 경우
    if (finalInfo.length === 2){
      
      //서로 비겼을 경우
      if (finalInfo[0]['totalCnt'] === finalInfo[1]['totalCnt']){
        result = {
          'vote': 'DRAW',
          'totalVoteCnt': finalInfo[0]['totalCnt'],
          'percent': 50
        }
      }
      else{
        result = {
          'vote': finalInfo[0]['vote'],
          'totalVoteCnt': finalInfo[0]['totalCnt'],
          'percent': parseInt(finalInfo[0]['totalCnt'] / (finalInfo[0]['totalCnt'] + finalInfo[1]['totalCnt']) * 100)
        }
      }
    }
    //몰표일 경우
    else if (finalInfo.length === 1){
      result = {
        'vote': finalInfo[0]['vote'],
        'totalVoteCnt': finalInfo[0]['totalCnt'],
        'percent': 100
      }
    }
    //아무도 투표하지 않았을 경우
    else if (finalInfo.length === 0){
      result = {
        'vote': 'DRAW',
        'totalVoteCnt': 0,
        'percent': 50
      }
    }

  return result;

  }catch(error){
    connection.release();
    logger.error(`getABTestFinalInfo DB Query Error: ${err}`);
    return false;
  }
}

//유저의 투표 정보 가져오기
const getUserVoteInfo = async (connection, userIdx, abTestIdx) => {
  try{
    let result = null;

    //유저의 투표 여부 및 투표 이미지 정보
    const userVote = await abTestDao.getUserVote(connection, abTestIdx, userIdx);

    if (userVote){
      const totalVotedCnt = await abTestDao.getCurrentVoteTotalCnt(connection, abTestIdx);  //총 투표 수
      const userVotedTotalCnt = await abTestDao.getCurrentUserVoteTotalCnt(connection, abTestIdx, userVote['vote']);  //유저가 투표한 표의 총 투표 수

      result = {
        'vote': userVote['vote'],
        'totalVoteCnt': userVotedTotalCnt,
        'percent': parseInt(userVotedTotalCnt / totalVotedCnt * 100)
      }
    }
    
    return result;
  }catch(err){
    connection.release();
    logger.error(`getUserVoteInfo DB Query Error: ${err}`);
    return false;
  }
}

module.exports = {
  getABTestFinalInfo,
  getUserVoteInfo,
}