const fs = require('graceful-fs')
const base64Img = require('base64-img')

const reportService = require('./report.services')
const { Logger, logFormat } = require('../../logger')
const { responseData, getServerTime } = require('../../utils/utils')

const readFile = fs.promises.readFile

exports.getServerTime = (req, res) => {
  responseData(res, { serverTime: getServerTime() })
}

exports.getImageBase64 = async (req, res) => {
  try {
    let { path } = req.query
    let fullpath = path.replace(/\\\\/g, '/')

    let pathName = fullpath.split('/')
    pathName.pop()
    pathName = pathName.join('/')

    const imageData = base64Img.base64Sync(fullpath)
    res.send(imageData)
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    res.status(500).send(error.message)
  }
}

exports.getAutoGaData = async (req, res) => {
  const data = await reportService.getAutoGaData(req)
  responseData(res, data)
}

exports.getReportData = async (req, res) => {
  const data = await reportService.getReportData(req)
  responseData(res, data)
}

exports.getReportHistory = async (req, res) => {
  const data = await reportService.getReportHistory(req)
  responseData(res, data)
}

exports.updateDiagReport = async (req, res) => {
  const data = await reportService.updateDiagReport(req)
  responseData(res, data)
}

exports.getDiagReport = async (req, res) => {
  const data = await reportService.getDiagReport(req)
  responseData(res, data)
}

exports.getAbnormalContent = async (req, res) => {
  const [data, reportId] = await reportService.getAbnormalContent(req)
  responseData(res, { data, reportId })
}

exports.getReportId = async (req, res) => {
  const data = await reportService.getReportId(req)
  responseData(res, data)
}

exports.getReportContent = async (req, res) => {
  const data = await reportService.getReportContent(req)
  responseData(res, data)
}

exports.createReportContent = async (req, res) => {
  const data = await reportService.createReportContent(req)
  responseData(res, data)
}

exports.getReportForm = async (req, res) => {
  const data = await reportService.getReportForm(req)
  responseData(res, data)
}

exports.prelimReport = async (req, res) => {
  const result = await reportService.prelimReport(req)
  responseData(res, { timestamp: result })
}

exports.verifyReport = async (req, res) => {
  const result = await reportService.verifyReport(req)
  responseData(res, { timestamp: result })
}

exports.updateReportContentValue = async (req, res) => {
  const data = await reportService.updateReportContentValue(req)
  responseData(res, data)
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
    res.send(data)
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    res.status(500).send(error.message)
  }
}

exports.getEfwByHN = async (req, res) => {
  const data = await reportService.getEfwByHN(req)
  responseData(res, data)
}
