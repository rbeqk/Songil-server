module.exports = function(app){
  const userController = require("./userController");

  app.get('/', userController.test);
}