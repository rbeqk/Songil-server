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
      const isArtist = await artistAskDao.isArtist(connection, [userIdx]);
      if (!isArtist) return errResponse(baseResponse.NO_PERMISSION);

      //작가idx 가져오기
      const artistIdx = await artistAskDao.getArtistIdx(connection, [userIdx]);

      const askCnt = await artistAskDao.getAskCnt(connection, [artistIdx]);
      
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
      const isArtist = await artistAskDao.isArtist(connection, [userIdx]);
      if (!isArtist) return errResponse(baseResponse.NO_PERMISSION);

      //작가idx 가져오기
      const artistIdx = await artistAskDao.getArtistIdx(connection, [userIdx]);

      const askCnt = await artistAskDao.getAskCnt(connection, [artistIdx]);
      
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (askCnt % pageItemCnt == 0) ? askCnt / pageItemCnt : parseInt(askCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지

      const startItemIdx = (page - 1) * pageItemCnt;

      //작가의 문의 목록 가져오기
      const askList = await artistAskDao.getAskList(connection, [artistIdx]);
      const askIdxList = askList.map(item => item.askIdx);

      //문의 목록 상세 정보 가져오기
      const askInfo = await artistAskDao.getAskInfo(connection, [askIdxList, startItemIdx, pageItemCnt]);

      let result = [];
      
      askInfo.forEach(item => {
        result.push({
          'askIdx': item.askIdx,
          'productIdx': item.productIdx,
          'productName': item.productName,
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