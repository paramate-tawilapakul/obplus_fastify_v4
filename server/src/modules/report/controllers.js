const fs = require('graceful-fs')
const base64Img = require('base64-img')

const reportService = require('./services')
const {
  responseData,
  getServerTime,
  handleErrorLog,
} = require('../../utils/utils')

const readFile = fs.promises.readFile

const fileModule = 'report > controllers >'

exports.getServerTime = (req, res) => {
  return responseData(res, { serverTime: getServerTime() })
}

exports.getImageBase64 = async (req, res) => {
  try {
    let { path } = req.query
    let fullpath = path.replace(/\\\\/g, '/')

    let pathName = fullpath.split('/')
    pathName.pop()
    pathName = pathName.join('/')

    const imageData = base64Img.base64Sync(fullpath)
    return res.send(imageData)
  } catch (error) {
    handleErrorLog(`${fileModule} getImageBase64(): ${error}`)
    return res.code(500).send(error.message)
  }
}

exports.getAutoGaData = async (req, res) => {
  const data = await reportService.getAutoGaData(req)
  return responseData(res, data)
}

exports.getReportData = async (req, res) => {
  const data = await reportService.getReportData(req)
  return responseData(res, data)
}

exports.getReportHistory = async (req, res) => {
  const data = await reportService.getReportHistory(req)
  return responseData(res, data)
}

exports.updateDiagReport = async (req, res) => {
  const data = await reportService.updateDiagReport(req)
  return responseData(res, data)
}

exports.getDiagReport = async (req, res) => {
  const data = await reportService.getDiagReport(req)
  return responseData(res, data)
}

exports.getAbnormalContent = async (req, res) => {
  const [data, reportId] = await reportService.getAbnormalContent(req)
  return responseData(res, { data, reportId })
}

exports.getReportId = async (req, res) => {
  const data = await reportService.getReportId(req)
  return responseData(res, data)
}

exports.getReportContent = async (req, res) => {
  const data = await reportService.getReportContent(req)
  return responseData(res, data)
}

exports.createReportContent = async (req, res) => {
  const data = await reportService.createReportContent(req)
  return responseData(res, data)
}

exports.getReportForm = async (req, res) => {
  const data = await reportService.getReportForm(req)
  return responseData(res, data)
}

exports.prelimReport = async (req, res) => {
  const result = await reportService.prelimReport(req)
  return responseData(res, { timestamp: result })
}

exports.verifyReport = async (req, res) => {
  const result = await reportService.verifyReport(req)
  return responseData(res, { timestamp: result })
}

exports.updateReportContentValue = async (req, res) => {
  const data = await reportService.updateReportContentValue(req)
  return responseData(res, data)
}

exports.viewReport = async (req, res) => {
  try {
    const { accession, reportUpdateDate } = req.query

    const year = reportUpdateDate.substring(0, 4)
    const month = reportUpdateDate.substring(4, 6)
    const day = reportUpdateDate.substring(6, 8)

    const filename = `${accession}.pdf`
    const fullpath = `${process.env.PDF_BACKUP_PATH}/${year}/${month}/${day}/${filename}`

    const data = await readFile(fullpath)
    res.header('Content-type', 'application/pdf')
    return res.send(data)
  } catch (error) {
    handleErrorLog(`${fileModule} viewReport(): ${error}`)
    return res.code(500).send(error.message)
  }
}

exports.getEfwByHN = async (req, res) => {
  const data = await reportService.getEfwByHN(req)
  return responseData(res, data)
}
