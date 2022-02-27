module.exports  = function(app){
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  const noticeController = require('./noticeController');

  //공지사항 조회 API
  app.get('/notice', noticeController.getNotice);

  //F&Q 조회 API
  app.get('/faq', noticeController.getFAQ);
}