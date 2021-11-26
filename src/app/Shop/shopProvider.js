const shopDao = require('./shopDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getTodayCraftTotalPage = async () => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      //현재는 상품 전체 개수와 동일
      const totalCnt = await shopDao.getTodayCraftTotalCnt(connection);

      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (totalCnt % pageItemCnt == 0) ? totalCnt / pageItemCnt : parseInt(totalCnt / pageItemCnt) + 1;  //총 페이지 수
      const result = {
        'totalPages': totalPages
      }

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getTodayCraftTotalPage DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getTodayCraftTotalPage DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}