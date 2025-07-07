const initEnv = require('./dotenv').default
initEnv()
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, json } = format
const dayjs = require('dayjs')

const myFormat = printf(({ message, timestamp }) => {
  return `${timestamp} ${message}`
})

exports.Logger = function (level = 'info') {
  if (level === 'error') {
    const date = dayjs().format('YYYYMMDDHHmmss')
    const year = date.substring(0, 4)
    const month = date.substring(4, 6)
    const day = date.substring(6, 8)

    const logPath = `${process.env.LOGS_PATH}/${year}/${month}/${day}/${level}.log`
    return createLogger({
      level,
      transports: [
        new transports.File({
          filename: logPath,
          level,
        }),
      ],
      format: combine(
        timestamp({ format: 'YYYYMMDDHHmmss' }),
        myFormat,
        json()
      ),
    })
  }

  return createLogger({
    level,
    transports: new transports.Console(),
    format: combine(timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }), myFormat),
    // transports: [
    //   new transports.File({
    //     filename: logPath,
    //     level,
    //   }),
    // ],
    // format: combine(timestamp({ format: 'YYYYMMDDHHmmss' }), myFormat, json()),
  })
}

exports.logFormat = function (req, action, username) {
  let userCode = ''
  if (req || username) {
    userCode = req.user?.code || username
    let ip = req?.ip || ''

    return `${ip}|${userCode}|${action}`
  }

  return `${action}`
}
