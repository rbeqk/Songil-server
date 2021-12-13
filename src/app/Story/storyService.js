const storyDao = require('./storyDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.changeUserStoryLikeStatus = async (userIdx, storyIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //유효한 storyIdx인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx){
        connection.release();
        return errResponse(baseResponse.INVALID_STORY_IDX);
      }

      //현재 user의 story 좋아요 여부 가져오기
      const currentUserStoryLikeStatus = await storyDao.getCurrentUserStoryLikeStatus(connection, userIdx, storyIdx);

      await connection.beginTransaction();

      //현재 좋아요 눌렀을 경우 -> 좋아요 삭제
      if (currentUserStoryLikeStatus === 'Y'){
        await storyDao.deleteUserStoryLike(connection, userIdx, storyIdx);
      }
      //현재 좋아요 누르지 않았을 경우 -> 좋아요 입력
      else if (currentUserStoryLikeStatus === 'N'){
        await storyDao.createUserStoryLike(connection, userIdx, storyIdx);
      }

      const result = {
        'isLike': currentUserStoryLikeStatus === 'Y' ? 'N' : 'Y',
        'totalLikeCnt': await storyDao.getTotalStoryLikeCnt(connection, storyIdx)
      };

      await connection.commit();
      connection.release();

      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      await connection.rollback();
      connection.release();
      logger.error(`changeUserStoryLikeStatus DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`changeUserStoryLikeStatus DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}