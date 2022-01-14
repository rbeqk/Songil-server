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
  ORDER BY Cart.createdAt DESC;
  `;
  const [rows] = await connection.query(query);
  return rows;
}

module.exports = {
  getCartCraftAmount,
  updateCartCraftAmount,
  addCartCraft,
  getCart,
}