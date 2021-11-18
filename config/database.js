const mysql = require('mysql2/promise');
const {logger} = require('./winston');

require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.dbHost,
    user: 'admin',
    port: '3306',
    password: process.env.dbPassword,
    database: process.env.dbName
});

module.exports = {
    pool: pool
};