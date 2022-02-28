const searchDao = require('../src/app/Search/searchDao');
const {pool} = require('../config/database');
const {logger} = require('../config/winston');

const getCorrespondIdxArr = async (connection, keyword, category) => {
  try{
    let correspondIdxArr = [];
    
    if (category === 'shop'){
      //작가명, 상품명, 상품 설명, 스토리 카테고리
      const craftCorrespondToBasic = await searchDao.getCraftCorrespondToBasic(connection, keyword);

      //소재
      const craftCorrespondToMaterial = await searchDao.getCraftCorrespondToMaterial(connection, keyword);

      //용도 아이템
      const craftCorrespondToUsage = await searchDao.getCraftCorrespondToUsage(connection, keyword);

      correspondIdxArr = Array.from(
        new Set([
        ...craftCorrespondToBasic,
        ...craftCorrespondToMaterial,
        ...craftCorrespondToUsage
        ])
      );
    }
    else if (category === 'with'){
      const storyCorrespond = await searchDao.getStoryCorrespond(connection, keyword);
      const qnaCorrespond = await searchDao.getQnACorrespond(connection, keyword);
      const abTestCorrespond = await searchDao.getAbTewstCorrespond(connection, keyword);

      correspondIdxArr = [...storyCorrespond, ...qnaCorrespond, ...abTestCorrespond];
    }
    else if (category === 'article'){
    
    }

    return correspondIdxArr;
  }catch(err){
    logger.error(`getCorrespondIdxArr DB Query Error: ${err}`);
    return false;
  }
}

module.exports = {
  getCorrespondIdxArr,
}