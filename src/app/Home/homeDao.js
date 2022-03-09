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
  SELECT R.idx, IFNULL(R.totalLikeCnt, 0) AS totalLikeCnt, R.categoryIdx, R.text, R.imageUrl, R.totalCommentCnt
  FROM (
          SELECT DISTINCT Q.qnaIdx                                              AS idx,
                          QL.totalLikeCnt,
                          1                                                     AS categoryIdx,
                          Q.title                                               AS text,
                          NULL                                                  as imageUrl,
                          (SELECT COUNT(userIdx)
                            FROM QnAComment QAC
                            WHERE QAC.qnaIdx = QL.qnaIdx && QAC.isDeleted = 'N') as totalCommentCnt
          FROM QnA Q
                    LEFT JOIN (SELECT qnaIdx, COUNT(*) AS totalLikeCnt
                              FROM QnALike
                              GROUP BY qnaIdx) QL
                              ON QL.qnaIdx = Q.qnaIdx
          WHERE Q.isDeleted = 'N'
          UNION ALL
          SELECT DISTINCT AB.abTestIdx AS idx,
                          ABV.totalLikeCnt,
                          2            AS categoryIdx,
                          U.nickname   AS text,
                          U.imageUrl,
                          NULL         AS totalCommentCnt
          FROM ABTest AB
                    LEFT JOIN (SELECT abTestIdx, COUNT(*) AS totalLikeCnt FROM ABTestVote) ABV
                              ON ABV.abTestIdx = AB.abTestIdx
                    JOIN Artist A ON A.artistIdx = AB.artistIdx && A.isDeleted = 'N'
                    JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
          WHERE AB.isDeleted = 'N'
      ) R
  ORDER BY totalLikeCnt DESC, R.idx DESC
  LIMIT 15;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//hot Story (좋아요 순 6개)
async function getHotStory(connection){
  const query = `
  SELECT DISTINCT S.storyIdx,
                  IFNULL(SL.totalLikeCnt, 0)                                                  AS totalLikeCnt,
                  (SELECT imageUrl FROM StoryImage SI WHERE SI.storyIdx = S.storyIdx LIMIT 1) AS mainImageUrl
  FROM Story S
          LEFT JOIN (SELECT storyIdx, COUNT(*) AS totalLikeCnt FROM StoryLike) SL ON SL.storyIdx = S.storyIdx
  WHERE S.isDeleted = 'N'
  ORDER BY totalLikeCnt DESC, S.storyIdx DESC
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