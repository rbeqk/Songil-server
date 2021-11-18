module.exports = function (app){
  const agreementController = require('./agreementController');

  app.get('/agreements', agreementController.getAgreements);
  app.get('/agreements/:agreementIdx', agreementController.getAgreementDetail);
}