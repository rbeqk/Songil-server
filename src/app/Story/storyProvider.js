const storyDao = require('./storyDao');
const likeDao = require('../Like/likeDao');
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const {response, errResponse} = require('../../../config/response');
const baseResponse = require('../../../config/baseResponseStatus');

exports.getStoryDetail = async (storyIdx, userIdx) => {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try{
      
      //존재하는 storyIdx인지
      const isExistStoryIdx = await storyDao.isExistStoryIdx(connection, storyIdx);
      if (!isExistStoryIdx) return errResponse(baseResponse.INVALID_STORY_IDX);

      const storyInfo = await storyDao.getStoryDetail(connection, storyIdx);
      const storyImage = await storyDao.getStoryImage(connection, storyIdx);
      const storyImageArr = storyImage.map(item => item.imageUrl);

      const storyTag = await storyDao.getStoryTag(connection, storyIdx);
      const storyTagArr = storyTag.map(item => item.tag);

      const result = {
        'storyIdx': storyInfo.storyIdx,
        'imageUrl': storyImageArr,
        'title': storyInfo.title,
        'content': storyInfo.content,
        'userIdx': storyInfo.userIdx,
        'userName': storyInfo.userName,
        'userIdx': storyInfo.userIdx,
        'userProfile': storyInfo.userProfile,
        'createdAt': storyInfo.createdAt,
        'totalLikeCnt': storyInfo.totalLikeCnt,
        'isLike': userIdx != -1 ? await likeDao.getStoryLikeStatus(connection, storyIdx, userIdx): 'N',
        'totalCommentCnt': storyInfo.totalCommentCnt,
        'tag': storyTagArr
      };

      connection.release();
      return response(baseResponse.SUCCESS, result);
      
    }catch(err){
      connection.release();
      logger.error(`getStoryDetail DB Query Error: ${err}`);
      return errResponse(baseResponse.DB_ERROR);
    }
  }catch(err){
    logger.error(`getStoryDetail DB Connection Error: ${err}`);
    return errResponse(baseResponse.DB_ERROR);
  }
}