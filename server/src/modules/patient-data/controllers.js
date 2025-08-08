const patientDataService = require('./services')
const { responseData } = require('../../utils/utils')

exports.createOrder = async (req, res) => {
  const data = await patientDataService.createOrder(req)
  return responseData(res, { success: data })
}

exports.createPatient = async (req, res) => {
  const data = await patientDataService.createPatient(req)
  return responseData(res, { success: data })
}

exports.getPatientRegistrationByHN = async (req, res) => {
  const { hn } = req.query
  const data = await patientDataService.getPatientRegistrationByHN(hn)
  return responseData(res, data[0] || null)
}

exports.getTemplateData = async (req, res) => {
  const { accession, fetus } = req.query
  const data = await patientDataService.getTemplateData(accession, fetus)
  return responseData(res, data || null)
}
