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