const askDao = require('./askDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');
const {ITEMS_PER_PAGE} = require("../../../modules/constants");

exports.getAsk = async (userIdx, page) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      let result = [];
      const startItemIdx = (page - 1) * ITEMS_PER_PAGE.USER_ASK_PER_PAGE;

      const ask = await askDao.getAsk(connection, userIdx, startItemIdx, ITEMS_PER_PAGE.USER_ASK_PER_PAGE);

      ask.forEach(item => {
        result.push({
          'askIdx': item.askIdx,
          'ask': {
            'craftIdx': item.craftIdx,
            'name': item.name,
            'content': item.content,
            'createdAt': item.createdAt,
            'status': item.status
          },
          'answer':(!item.askAnswerIdx) ? null : {
            'artistIdx': item.artistIdx,
            'artistName': item.artistName,
            'content': item.answerContent,
            'createdAt': item.answerCreatedAt
          }
        })
      });

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