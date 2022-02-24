const {ORDER_STATUS} = require("../../../modules/constants");

//작가 craft 관한 orderCraftIdx인지
async function isArtistOrderCraftIdx(connection, artistIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT OC.orderCraftIdx
      FROM OrderCraft OC
              JOIN Craft C ON OC.craftIdx = C.craftIdx
      WHERE OC.orderCraftIdx = ${orderCraftIdx} && C.artistIdx = ${artistIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//주문자 정보 확인
async function getOrderCraftUserInfo(connection, orderCraftIdx){
  const query = `
  SELECT OC.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname                                    as artistName,
        OC.totalCraftPrice                            AS price,
        OC.amount,
        O.recipient,
        O.phone,
        CONCAT('(', O.zipcode, ')', O.address, ' ', O.detailAddress) as address,
        O.memo
  FROM OrderCraft OC
          JOIN Craft C ON OC.craftIdx = C.craftIdx
          JOIN OrderT O ON OC.orderIdx = O.orderIdx
          JOIN Artist A ON C.artistIdx = A.artistIdx
          JOIN User U ON A.userIdx = U.userIdx
  WHERE OC.orderCraftIdx = ${orderCraftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//작가관련 주문현황 총 개수(=날짜 개수) 가져오기
async function getBasicOrderListCnt(connection, artistIdx){
  const query = `
  SELECT COUNT(DISTINCT DATE_FORMAT(O.createdAt, '%Y-%m-%d')) AS totalCnt
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
  WHERE C.artistIdx = ${artistIdx} &&
        OC.orderCraftIdx NOT IN (${ORDER_STATUS.REQUEST_CANCEL}, ${ORDER_STATUS.REQUEST_RETURN});
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

///반품/취소 요청 현황 총 개수(=날짜 개수) 가져오기
async function getCancelOrReturnList(connection, artistIdx){
  const query = `
  SELECT COUNT(DISTINCT DATE_FORMAT(O.createdAt, '%Y-%m-%d')) AS totalCnt
  FROM OrderCraft OC
          JOIN OrderT O ON O.orderIdx = OC.orderIdx
          JOIN Craft C ON C.craftIdx = OC.craftIdx
  WHERE C.artistIdx = ${artistIdx} &&
        OC.orderCraftIdx IN (${ORDER_STATUS.REQUEST_CANCEL}, ${ORDER_STATUS.REQUEST_RETURN});
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

module.exports = {
  isArtistOrderCraftIdx,
  getOrderCraftUserInfo,
  getBasicOrderListCnt,
  getCancelOrReturnList,
}