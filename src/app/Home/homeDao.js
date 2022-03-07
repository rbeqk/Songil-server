//상단 아티클 가져오기(최신순 4개)
async function getArticleList(connection){
  const query = `
  SELECT articleIdx, articleCategoryIdx as categoryIdx, title, mainImageUrl, summary
  FROM Article
  WHERE isDeleted = 'N'
  ORDER BY articleIdx DESC
  LIMIT 4;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//trendCraft 가져오기(랜덤 15개 - soldout 제외)
async function getTrendCraft(connection){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                               as artistName,
        IF(TIMESTAMPDIFF(DAY, C.createdAt, NOW()) > 3, 'N', 'Y') as isNew
  FROM Craft C
          JOIN Artist A on C.artistIdx = A.artistIdx && A.isDeleted = 'N'
          JOIN User U on A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N' && C.isSoldOut = 'N'
  ORDER BY RAND()
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//recommend 가져오기 (랜덤 15개 - soldout 제외)
async function getRecommend(connection){
  const query = `
  SELECT C.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                               as artistName,
        C.price
  FROM Craft C
          JOIN Artist A on C.artistIdx = A.artistIdx && A.isDeleted = 'N'
          JOIN User U on A.userIdx = U.userIdx && U.isDeleted = 'N'
  WHERE C.isDeleted = 'N' && C.isSoldOut = 'N'
  ORDER BY RAND()
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//talk with (15개 / 커뮤니티 쪽 hot talk와 동일 기준)
//1: QnA / 2: abTest
async function getTalkWith(connection){
  const query = `
  SELECT QL.qnaIdx as idx, COUNT(QL.userIdx) as totalLikeCnt, 1 as categoryIdx, Q.title as text
  FROM QnALike QL
          JOIN QnA Q ON Q.qnaIdx = QL.qnaIdx && Q.isDeleted = 'N'
  GROUP BY QL.qnaIdx
  UNION ALL
  SELECT ABV.abTestIdx as idx, COUNT(ABV.userIdx) as totalLikeCnt, 2 as categoryIdx, U.nickname as text
  FROM ABTestVote ABV
          JOIN ABTest AB ON AB.abTestIdx = ABV.abTestIdx && AB.isDeleted = 'N'
          JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  GROUP BY ABV.abTestIdx
  ORDER BY totalLikeCnt DESC
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//hot Story (좋아요 순 6개)
async function getHotStory(connection){
  const query = `
  SELECT SL.storyIdx,
        COUNT(SL.userIdx) as totalLikeCnt,
        (SELECT SI.imageUrl
          FROM StoryImage SI
          WHERE SI.storyIdx = SL.storyIdx
          LIMIT 1)         as mainImageUrl
  FROM StoryLike SL
          JOIN Story S ON S.storyIdx = SL.storyIdx && S.isDeleted = 'N'
  GROUP BY SL.storyIdx
  ORDER BY totalLikeCnt DESC
  LIMIT 6;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getArticleList,
  getTrendCraft,
  getRecommend,
  getTalkWith,
  getHotStory,
}