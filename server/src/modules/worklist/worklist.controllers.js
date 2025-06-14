const worklistService = require('./worklist.services')
const { responseDataWithTotal, responseData } = require('../../utils/utils')

exports.getWorklist = async (req, reply) => {
  const [data, total] = await worklistService.getWorklist(req)
  responseDataWithTotal(reply, total, data)
}

exports.getPatientOb = async (req, res) => {
  const data = await worklistService.getPatientOb(req)
  responseData(res, data)
}

exports.updateObStudy = async (req, res) => {
  let data = await worklistService.updateObStudy(req)
  responseData(res, data)
}

exports.getConsultant = async (req, res) => {
  const data = await worklistService.getConsultant(req)
  responseData(res, data)
}

exports.getTeachingWorklist = async (req, res) => {
  const [data, total] = await worklistService.getTeachingWorklist(req)

  responseDataWithTotal(res, total, data)
}

exports.autoGenerateOrder = async (req, res) => {
  const result = await worklistService.autoGenerateOrder(
    req.user?.code || 'admin',
    req.query.total
  )
  responseData(res, { result })
}
