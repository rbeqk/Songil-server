const express = require('./config/express');
const {logger} = require('./config/winston');

const port = 3000;
express().listen(port, '0.0.0.0');
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);