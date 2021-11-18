const agreementProvider = require("./agreementProvider");
const agreementService = require("./agreementService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

/*
  API No. 0.0
  API Name: 이용약관 전체 조회 API
  [GET] /agreements
*/
exports.getAgreements = async (req, res) => {
  const agreements = await agreementProvider.getAgreements();

  return res.send(agreements);
}