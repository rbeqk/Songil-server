const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
let cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

require('dotenv').config();

const options = {
  host: process.env.dbHost,
  user: 'admin',
  port: '3306',
  password: process.env.dbPassword,
  database: process.env.dbName
}

const sessionStore = new MySQLStore(options);

module.exports = function (){
  const app = express();

  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(methodOverride());
  app.use(cors());
  app.use(session({
    key: 'sid',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 3},
    store: sessionStore
  }));

  require('../modules/deliveryUtil');
  require('../src/app/CraftComment/craftCommentRoute')(app);
  require('../src/app/Like/likeRoute')(app);
  require('../src/app/Shop/shopRoute')(app);
  require('../src/app/Ask/askRoute')(app);
  require('../src/app/Article/articleRoute')(app);
  require('../src/app/ArtistPlace/artistPlaceRoute')(app);
  require('../src/app/ArtistAsk/artistAskRoute')(app);
  require('../src/app/Search/searchRoute')(app);
  require('../src/app/Story/storyRoute')(app);
  require('../src/app/StoryComment/storyCommentRoute')(app);
  require('../src/app/QnA/qnaRoute')(app);
  require('../src/app/ABTest/abTestRoute')(app);
  require('../src/app/QnAComment/qnaCommentRoute')(app);
  require('../src/app/ABTestComment/abTestCommentRoute')(app);
  require('../src/app/MyPage/myPageRoute')(app);
  require('../src/app/Home/homeRoute')(app);
  require('../src/app/With/withRoute')(app);
  require('../src/app/Craft/craftRoute')(app);
  require('../src/app/Cart/cartRoute')(app);
  require('../src/app/Benefit/benefitRoute')(app);
  require('../src/app/Auth/authRoute')(app);
  require('../src/app/Order/orderRoute')(app);
  require('../src/app/OrderStatus/orderStatusRoute')(app);
  require('../src/app/Delivery/deliveryRoute')(app);
  require('../src/app/ArtistPage/artistPageRoute')(app);
  require('../src/app/OrderCancel/orderCancelRoute')(app);
  require('../src/app/OrderReturn/orderReturnRoute')(app);
  require('../src/app/Notice/noticeRoute')(app);

  return app;
}