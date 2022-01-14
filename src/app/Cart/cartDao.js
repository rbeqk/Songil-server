//해당 상품 장바구니에 담겨있는 수량 가져오기
async function getCartCraftAmount(connection, userIdx, craftIdx){
  const query = `
  SELECT amount FROM Cart
  WHERE userIdx = ${userIdx} && craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]?.amount ? rows[0].amount : 0;
}

//해당 상품 장바구니 개수 수정
async function updateCartCraftAmount(connection, userIdx, craftIdx, updateAmount){
  const query = `
  UPDATE Cart
  SET amount = ${updateAmount}
  WHERE userIdx = ${userIdx} && craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//상품 장바구니 추가
async function addCartCraft(connection, userIdx, craftIdx, amount){
  const query = `
  INSERT INTO Cart(userIdx, craftIdx, amount)
  VALUES (${userIdx}, ${craftIdx}, ${amount});
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//장바구니 조회
async function getCart(connection, userIdx){
  const query = `
  SELECT Cart.craftIdx,
        C.mainImageUrl,
        C.name,
        C.artistIdx,
        U.nickname as artistName,
        C.price,
        Cart.amount
  FROM Cart
          JOIN Craft C ON C.craftIdx = Cart.craftIdx && C.isDeleted = 'N' && C.isSoldOut = 'N'
          JOIN Artist A ON A.artistIdx = C.artistIdx && A.isDeleted = 'N'
          JOIN User U ON U.userIdx = A.userIdx && U.isDeleted = 'N'
  WHERE Cart.userIdx = ${userIdx}
  ORDER BY Cart.updatedAt DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//장바구니 상품 개수 조회
async function getCartCnt(connection, userIdx){
  const query = `
  SELECT COUNT(*) as totalCnt
  FROM Cart
  JOIN Craft C ON C.craftIdx = Cart.craftIdx && C.isDeleted = 'N' && C.isSoldOut = 'N'
  WHERE Cart.userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

//품절된 상품인지
async function isSoldOutCraft(connection, craftIdx){
  const query = `
  SELECT IF(isSoldOut = 'Y', 1, 0) as isSoldOut FROM Craft
  WHERE craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isSoldOut'];
}

//장바구니에 담긴 상품인지
async function isCraftInCart(connection, userIdx, craftIdx){
  const query = `
  SELECT EXISTS(SELECT *
    FROM Cart
            JOIN Craft C on Cart.craftIdx = C.craftIdx && C.isSoldOut = 'N' && C.isDeleted = 'N'
    WHERE Cart.userIdx = ${userIdx} && Cart.craftIdx = ${craftIdx}) as isExist;
  `;
  const [rows] = await connection.query(query);
  return rows[0]['isExist'];
}

//장바구니 상품 삭제
async function deleteCartCraft(connection, userIdx, craftIdx){
  const query = `
  DELETE FROM Cart
  WHERE userIdx = ${userIdx} && craftIdx = ${craftIdx};
  `;
  const [rows] = await connection.query(query);
  return rows;
}

//현재 장바구니 개수 조회
async function getCurrentCartCnt(connection, userIdx){
  const query = `
  SELECT COUNT(Cart.craftIdx) as totalCnt
  FROM Cart
          JOIN Craft C ON C.craftIdx = Cart.craftIdx && C.isDeleted = 'N' && C.isSoldOut = 'N'
  WHERE Cart.userIdx = ${userIdx};
  `;
  const [rows] = await connection.query(query);
  return rows[0]['totalCnt'];
}

module.exports = {
  getCartCraftAmount,
  updateCartCraftAmount,
  addCartCraft,
  getCart,
  getCartCnt,
  isSoldOutCraft,
  isCraftInCart,
  deleteCartCraft,
  getCurrentCartCnt,
}