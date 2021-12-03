const askDao = require('./askDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getAskTotalPage = async (params) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      const askCnt = await askDao.getAskCnt(connection, params);
      
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

exports.getAsk = async (params) => {
  const userIdx = params[0];
  const page = params[1];
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{

      const askCnt = await askDao.getAskCnt(connection, userIdx);
      
      const pageItemCnt = 5;  //한 페이지당 보여줄 아이템 개수
      const totalPages = (askCnt % pageItemCnt == 0) ? askCnt / pageItemCnt : parseInt(askCnt / pageItemCnt) + 1;  //총 페이지 수
      if (page <= 0 || page > totalPages) return errResponse(baseResponse.INVALID_PAGE);  //존재하는 page인지

      let result = [];
      const startItemIdx = (page - 1) * pageItemCnt;

      const ask = await askDao.getAsk(connection, [userIdx, startItemIdx, pageItemCnt]);

      ask.forEach(item => {
        result.push({
          'askIdx': item.askIdx,
          'ask': {
            'craftIdx': item.craftIdx,
            'name': item.name,
            'content': item.content,
            'createdAt': item.askCreatedAt,
            'status': item.status
          },
          'answer':(!item.craftAskAnswerIdx) ? null : {
            'artistIdx': item.artistIdx,
            'artistName': item.artistName,
            'content': item.answerContent,
            'createdAt': item.answerCreatedAt
          }
        })
      })

      result = result.reverse();

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