const uap = require('ua-parser-js')
const dayjs = require('dayjs')

const db = require('../../db/config')
const { Logger, logFormat } = require('../../logger')

exports.MODULE = {
  REGISTRATION: 'REGISTRATION',
  USER: 'USER',
  REPORT: 'REPORT',
}

exports.addLogs = async (req, data) => {
  try {
    // console.log(req.headers['user-agent'])
    let ua = uap(req.headers['user-agent'])
    // console.log(ua)
    // console.log(ua.browser.name)
    // console.log(ua.browser.version)
    // console.log(ua.os.name)
    // console.log(req.ip)

    await db('OB_LOGGER').insert({
      user_code: req.user?.code || '',
      module: data.module,
      activity: data.activity,
      patient_accession: data?.accession || '',
      client_os: ua.os.name,
      client_browser: ua.browser.name + '/' + ua.browser.version,
      client_ip: req.ip,
      timestamp: dayjs().format('YYYYMMDDHHmmss'),
    })
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}
