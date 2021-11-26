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

  require('../src/app/User/userRoute')(app);
  require('../src/app/Agreement/agreementRoute')(app);
  require('../src/app/Shop/shopRoute')(app);
  require('../src/app/Review/reviewRoute')(app);
  require('../src/app/Like/likeRoute')(app);

  return app;
}