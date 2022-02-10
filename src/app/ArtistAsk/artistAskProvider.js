const artistAskDao = require('./artistAskDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {getTotalPage} = require("../../../modules/pageUtil");
const {ARTIST_ASK_ASK_PER_PAGE} = require("../../../modules/constants");

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

      const totalCnt = await artistAskDao.getAskCnt(connection, artistIdx);
      const totalPages = getTotalPage(totalCnt, ARTIST_ASK_ASK_PER_PAGE);
      
      const result = {
        'totalPages': totalPages,
        'itemsPerPage': ARTIST_ASK_ASK_PER_PAGE
      };

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
      
      const startItemIdx = (page - 1) * ARTIST_ASK_ASK_PER_PAGE;

      //작가의 문의 목록 가져오기
      const askList = await artistAskDao.getAskList(connection, artistIdx);

      //문의 목록 상세 정보 가져오기
      const askInfo = await artistAskDao.getAskInfo(connection, askList, startItemIdx, ARTIST_ASK_ASK_PER_PAGE);

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

exports.getAskDetail = async (askIdx, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      //존재하는 askIdx인지
      const isExistAskIdx = await artistAskDao.isExistAskIdx(connection, askIdx);
      if (!isExistAskIdx){
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
      const isArtistAsk = await artistAskDao.isArtistAsk(connection, askIdx, artistIdx);
      if (!isArtistAsk){
        connection.release();
        return errResponse(baseResponse.NO_PERMISSION);
      }

      const askDetail = await artistAskDao.getAskDetail(connection, askIdx);

      const result = {
        'askIdx': askDetail.askIdx,
        'craftIdx': askDetail.craftIdx,
        'name': askDetail.name,
        'userIdx': askDetail.userIdx,
        'nickname': askDetail.nickname,
        'askContent': askDetail.askContent,
        'answerContent': askDetail.answerContent
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