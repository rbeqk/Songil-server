const homeProvider = require("./homeProvider");

/*
  API No. 3.11
  API Name: 상품 상세 조회 API
  [GET] /shop/crafts/:craftIdx
*/
exports.getHome = async (req, res) => {  
  const getHome = await homeProvider.getHome();

  return res.send(getHome);
}