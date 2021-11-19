const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
let cors = require('cors');
const session = require('express-session');

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
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 3}
  }));

  require('../src/app/User/userRoute')(app);
  require('../src/app/Agreement/agreementRoute')(app);
  require('../src/app/Shop/shopRoute')(app);

  return app;
}