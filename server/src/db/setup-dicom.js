const initEnv = require('../dotenv').default
initEnv()

const db = require('knex')({
  client: 'mssql',
  connection: {
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    database: 'DICOMDB',
    options: {
      encrypt: false,
      enableArithAbort: true,
      trustedConnection: false,
      trustServerCertificate: false,
    },
  },
  pool: {
    min: 5,
    max: 30,
  },
})

module.exports = db
