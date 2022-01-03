const artistAskDao = require('./artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getAskTotalPage = async (userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //작가 여부
      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //작가idx 가져오기
      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);

      const askCnt = await artistAskDao.getAskCnt(connection, artistIdx);
      
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (askCnt % pageItemCnt == 0) ? askCnt / pageItemCnt : parseInt(askCnt / pageItemCnt) + 1;  //총 페이지 수
      
      const result = {'totalPages': totalPages};

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getAskTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getAskTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getAsk = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //작가 여부
      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //작가idx 가져오기
      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);
      
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const startItemIdx = (page - 1) * pageItemCnt;

      //작가의 문의 목록 가져오기
      const askList = await artistAskDao.getAskList(connection, artistIdx);

      //작가의 문의 목록 없을 경우 유효하지 않은 값으로 설정
      let askIdxList;
      askIdxList = askList.length > 0 ? askList.map(item => item.askIdx) : -1;

      //문의 목록 상세 정보 가져오기
      const askInfo = await artistAskDao.getAskInfo(connection, askIdxList, startItemIdx, pageItemCnt);

      let result = [];
      
      askInfo.forEach(item => {
        result.push({
          'askIdx': item.askIdx,
          'craftIdx': item.craftIdx,
          'name': item.name,
          'nickname': item.nickname,
          'createdAt': item.createdAt,
          'status': item.status,
        })
      })

      result.reverse();

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getAsk DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getAsk DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getAskDetail = async (craftAskIdx, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 craftAskIdx인지
      const isExistCraftAskIdx = await artistAskDao.isExistCraftAskIdx(connection, craftAskIdx);
      if (!isExistCraftAskIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_ASK_IDX);
      }

      //작가 여부
      const isArtist = await artistAskDao.isArtist(connection, userIdx);
      if (!isArtist){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      //작가idx 가져오기
      const artistIdx = await artistAskDao.getArtistIdx(connection, userIdx);

      //문의에 대한 작가 권한 확인
      const isArtistAsk = await artistAskDao.isArtistAsk(connection, craftAskIdx, artistIdx);
      if (!isArtistAsk){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const askDetail = await artistAskDao.getAskDetail(connection, craftAskIdx);

      const result = {
        'askIdx': askDetail.askIdx,
        'craftIdx': askDetail.askIdx,
        'craftName': askDetail.craftName,
        'userIdx': askDetail.userIdx,
        'nickname': askDetail.nickname,
        'askContent': askDetail.askContent,
        'answerContent': askDetail.answerContent,
        'craftIsDeleted': askDetail.craftIsDeleted,
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);

    }catch(err){
      connection.release();
      logger.error(`getAskDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getAskDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}