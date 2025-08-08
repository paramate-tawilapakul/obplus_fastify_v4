const worklistService = require('./services')
const { responseDataWithTotal, responseData } = require('../../utils/utils')

exports.getWorklist = async (req, reply) => {
  const [data, total] = await worklistService.getWorklist(req)
  return responseDataWithTotal(reply, total, data)
}

exports.getPatientOb = async (req, res) => {
  const data = await worklistService.getPatientOb(req)
  return responseData(res, data)
}

exports.updateObStudy = async (req, res) => {
  let data = await worklistService.updateObStudy(req)
  return responseData(res, data)
}

exports.getConsultant = async (req, res) => {
  const data = await worklistService.getConsultant(req)
  return responseData(res, data)
}

exports.getTeachingWorklist = async (req, res) => {
  const [data, total] = await worklistService.getTeachingWorklist(req)

  return responseDataWithTotal(res, total, data)
}

exports.autoGenerateOrder = async (req, res) => {
  const result = await worklistService.autoGenerateOrder(
    req.user?.code || 'admin',
    req.query.total
  )
  return responseData(res, { result })
}
