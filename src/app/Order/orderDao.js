//존재&&품절X 상품 idx 개수
async function getExistCraftIdxLen(connection, craftIdxArr){
  const query = `
  SELECT COUNT(craftIdx) as totalCnt FROM Craft
  WHERE isDeleted = 'N' && isSoldOut = 'N' && craftIdx IN (?);
  `;
  const [rows] = await connection.query(query, [craftIdxArr]);
  return rows[0]['totalCnt'];
}

//상품 가격 가져오기
async function getCraftPrice(connection, craftIdx){
  const query = `
  SELECT price FROM Craft
  WHERE craftIdx = ${craftIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['price'];
}

//상품 기본 배송비 가져오기
async function getCraftBasicShippingFee(connection, craftIdx, totalCraftPrice){
  const query = `
  SELECT IF(toFreeShippingFee IS NULL,
      basicShippingFee,
      IF(${totalCraftPrice} >= toFreeShippingFee, 0, basicShippingFee)) as basicShippingFee FROM Craft
  WHERE craftIdx = ${craftIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['basicShippingFee'];
}

//주문 생성
async function createOrder(connection, userIdx, totalCraftPrice, totalBasicShippingFee){
  const query = `
  INSERT INTO OrderT(userIdx, totalCraftPrice, totalBasicShippingFee)
  VALUES (${userIdx}, ${totalCraftPrice}, ${totalBasicShippingFee});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//주문 상품 생성
async function createOrderCraft(connection, orderIdx, craftIdx, amount, totalCraftPrice, basicShippingFee){
  const query = `
  INSERT INTO OrderCraft(orderIdx, craftIdx, amount, totalCraftPrice, basicShippingFee)
  VALUES (${orderIdx}, ${craftIdx}, ${amount}, ${totalCraftPrice}, ${basicShippingFee});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 정보 가져오기
async function getCraftInfo(connection, craftIdx){
  const query = `
  SELECT C.craftIdx, C.mainImageUrl, C.name, C.artistIdx, U.nickname as artistName
  FROM Craft C
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE C.craftIdx = ${craftIdx} && C.isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0];
}

//유저 포인트 가져오기
async function getUserPoint(connection, userIdx){
  const query = `
  SELECT point FROM User
  WHERE userIdx = ${userIdx} && isDeleted = 'N';
  `;
  const [rows] = await connection.query(query);
  return rows[0]['point'];
}

module.exports = {
  getExistCraftIdxLen,
  getCraftPrice,
  getCraftBasicShippingFee,
  createOrder,
  createOrderCraft,
  getCraftInfo,
  getUserPoint,
}