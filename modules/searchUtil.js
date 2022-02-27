const searchDao = require('../src/app/Search/searchDao');
const {pool} = require('../config/database');
const {logger} = require('../config/winston');

const getCorrespondIdxArr = async () => {
  try{
    let correspondIdxArr = [];
    
    if (keyword === 'shop'){
      //작가명, 상품명, 상품 설명, 스토리 카테고리
      const craftCorrespondToBasic = await searchDao.getCraftCorrespondToBasic(connection, keyword);

      //소재
      const craftCorrespondToMaterial = await searchDao.getCraftCorrespondToMaterial(connection, keyword);

      //용도
      const craftCorrespondToUsage = await searchDao.getCraftCorrespondToUsageCraft(connection, keyword);

      correspondIdxArr = [
        new Set(
        ...craftCorrespondToBasic,
        ...craftCorrespondToMaterial,
        ...craftCorrespondToUsage)
      ];
    }
    else if (keyword === 'with'){

    }
    else if (keyword === 'article'){

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