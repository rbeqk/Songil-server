const benefitProvider = require('./benefitProvider');
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 8.16
  API Name: 보유 베네핏 조회 API
  [GET] /my-page/benefits
*/
exports.getBenefits = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  
  const getBenefits = await benefitProvider.getBenefits(userIdx);

  return res.send(getBenefits);
}

/*
  API No. 12.3
  API Name: 주문 시 적용 가능 베네핏 조회 API
  [GET] /order/:orderIdx/benefits
*/
exports.getCanUseBenefit = async (req, res) => {
  const {userIdx} = req.verifiedToken;
  const {orderIdx} = req.params;

  const getCanUseBenefit = await benefitProvider.getCanUseBenefit(userIdx, orderIdx);

  return res.send(getCanUseBenefit);
}