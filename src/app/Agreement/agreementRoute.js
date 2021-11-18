module.exports = function (app){
  const agreementController = require('./agreementController');

  app.get('/agreements', agreementController.getAgreements);
}