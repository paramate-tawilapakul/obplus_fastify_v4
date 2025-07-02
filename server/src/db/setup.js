const initEnv = require('../dotenv').default
initEnv()

const db = require('knex')({
  client: 'mssql',
  connection: {
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    options: {
      instanceName: process.env.DB_INSTANCE || '',
      encrypt: false,
      enableArithAbort: true,
      trustedConnection: false,
      trustServerCertificate: false,
    },
    requestTimeout: 20000, // 20 s
  },
  pool: {
    min: 5,
    max: 30,
    idleTimeoutMillis: 30000, // cleans idle connections after 30 seconds
    acquireTimeoutMillis: 30000, // If a connection is not available within 30 seconds, Knex.js will throw an error. This prevents your application from waiting indefinitely for a connection
    createTimeoutMillis: 30000, // Limits the amount of time a connection can take to be created before timing out.
    reapIntervalMillis: 20000, // Check for and close idle connections every 20 seconds. This helps maintain the pool and avoid resource leaks.
  },
})

module.exports = db
