const searchDao = require('../src/app/Search/searchDao');
const {pool} = require('../config/database');
const {logger} = require('../config/winston');

const getCraftCorrespond = async (connection, keyword) => {
  try{
    //작가명, 상품명, 상품 설명, 스토리 카테고리
    const craftCorrespondToBasic = await searchDao.getCraftCorrespondToBasic(connection, keyword);

    //소재
    const craftCorrespondToMaterial = await searchDao.getCraftCorrespondToMaterial(connection, keyword);

    //용도 아이템
    const craftCorrespondToUsage = await searchDao.getCraftCorrespondToUsage(connection, keyword);

    const correspondIdxArr = Array.from(
      new Set([
      ...craftCorrespondToBasic,
      ...craftCorrespondToMaterial,
      ...craftCorrespondToUsage
      ])
    );

    return correspondIdxArr;
  }
  catch(err){
    logger.error(`getCraftCorrespond DB Query Error: ${err}`);
    return false;
  }
}

const getCorrespondIdxArr = async (connection, keyword, category) => {
  try{
    let correspondIdxArr = [];
    
    if (category === 'shop'){
      correspondIdxArr = await getCraftCorrespond(connection, keyword);
    }
    else if (category === 'with'){
      const storyCorrespond = await searchDao.getStoryCorrespond(connection, keyword);
      const qnaCorrespond = await searchDao.getQnACorrespond(connection, keyword);
      const abTestCorrespond = await searchDao.getAbTewstCorrespond(connection, keyword);

      correspondIdxArr = [...storyCorrespond, ...qnaCorrespond, ...abTestCorrespond];
    }
    else if (category === 'article'){
      //제목, 요약, 카테고리명, 에디터 이름
      const articleCorrespondToBasic = await searchDao.getArticleCorrspondToBasic(connection, keyword);

      //태그
      const articleCorrespondToTag = await searchDao.getArticleCorrespondToTag(connection, keyword);

      //상품
      const craftCorrespond = await getCraftCorrespond(connection, keyword);
      const articleCorrespondToCraft = await searchDao.getArticleCorrespondToCraft(connection, craftCorrespond);

      //내용
      const articleCorrespondToContent = await searchDao.getArticleCorrespondToContent(connection, keyword);

      correspondIdxArr = Array.from(
        new Set([
          ...articleCorrespondToBasic,
          ...articleCorrespondToTag,
          ...articleCorrespondToCraft,
          ...articleCorrespondToContent
        ])
      );
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