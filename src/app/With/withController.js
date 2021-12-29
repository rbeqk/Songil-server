const withProvider = require("./withProvider");

/*
  API No. 5.1
  API Name: hot talk 조회 API
  [GET] /with/hot-talk
*/
exports.getHotTalk = async (req, res) => {  
  const getHotTalk = await withProvider.getHotTalk();

  return res.send(getHotTalk);
}