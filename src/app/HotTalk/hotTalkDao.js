//Hot Talk 15개 가져오기
async function getHotTalk(connection){
  const query = `
  SELECT QL.qnaIdx                                             as idx,
        COUNT(QL.userIdx)                                     as totalLikeCnt,
        1                                                     as categoryIdx,
        Q.title                                               as text,
        NULL                                                  as imageUrl,
        (SELECT COUNT(userIdx)
          FROM QnAComment QAC
          WHERE QAC.qnaIdx = QL.qnaIdx && QAC.isDeleted = 'N') as totalCommentCnt
  FROM QnALike QL
          JOIN QnA Q ON Q.qnaIdx = QL.qnaIdx && Q.isDeleted = 'N'
  GROUP BY QL.qnaIdx
  UNION ALL
  SELECT ABV.abTestIdx      as idx,
        COUNT(ABV.userIdx) as totalLikeCnt,
        2                  as categoryIdx,
        U.nickname         as text,
        U.imageUrl,
        NULL               as totalCommentCnt
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

module.exports = {
  getHotTalk,
}