//존재하는 orderCraftIdx인지
async function isExistOrderCraftIdx(connection, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT orderCraftIdx
    FROM OrderCraft
    WHERE orderCraftIdx = ${orderCraftIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//유저의 orderCraftIdx인지
async function isUserOrderOrderCraftIdx(connection, userIdx, orderCraftIdx){
  const query = `
  SELECT EXISTS(SELECT OC.orderCraftIdx
    FROM OrderCraft OC
            JOIN OrderT O ON O.orderIdx = OC.orderIdx
    WHERE OC.orderCraftIdx = ${orderCraftIdx} && O.userIdx = ${userIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//결제 상세 정보 가져오기
async function getOrderDetail(connection, orderCraftIdx){
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
        O.address,
        O.memo,
        OC.totalCraftPrice,
        OC.basicShippingFee,
        OC.extraShippingFee,
        OC.pointDiscount,
        OC.benefitDiscount,
        OC.totalCraftPrice + OC.basicShippingFee + OC.extraShippingFee
            - (OC.pointDiscount + OC.benefitDiscount) AS finalPrice
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

module.exports = {
  isExistOrderCraftIdx,
  isUserOrderOrderCraftIdx,
  getOrderDetail,
}