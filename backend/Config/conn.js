const Mysql = require('mysql');


/**
 * Database metadata
 */
const dbconfig = {
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    port:process.env.DB_PORT,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
}

const DB = Mysql.createPool({
    host:dbconfig.host,
    user:dbconfig.user,
    port:dbconfig.port,
    password:dbconfig.password,
    database:dbconfig.database,
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
})

module.exports = DB;