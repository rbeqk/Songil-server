const mysql = require('mysql2/promise');
const {logger} = require('./winston');

const pool = mysql.createPool({
    host: 'songil-db.cvvepsxoj1ow.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    port: '3306',
    password: 'hyunbin7231',
    database: 'songil-dev'
});

module.exports = {
    pool: pool
};