const systemDataService = require('./services')
const { responseDataWithTotal, responseData } = require('../../utils/utils')

exports.getPatientRegisData = async (req, res) => {
  const data = await systemDataService.getPatientRegisData(req.query.hn)
  return responseData(res, data)
}

exports.getLocations = async (req, res) => {
  const [data, total] = await systemDataService.getLocations()
  return responseDataWithTotal(res, total, data)
}

exports.getSystemProperties = async (req, res) => {
  const [data, total] = await systemDataService.getSystemProperties()
  const newData = { ...data, username: req.user.code }
  return responseDataWithTotal(res, total, newData)
}

exports.getDoctor = async (req, res) => {
  const [data, total] = await systemDataService.getDoctor()
  return responseDataWithTotal(res, total, data)
}

exports.getTimeGuarantee = async (req, res) => {
  const [data, total] = await systemDataService.getTimeGuarantee()
  return responseDataWithTotal(res, total, data)
}

exports.getMasterTags = async (req, res) => {
  const data = await systemDataService.getMasterTags()
  return responseData(res, data)
}

exports.getIndications = async (req, res) => {
  const data = await systemDataService.getIndications()
  return responseData(res, data)
}

exports.getAvailableProtocol = async (req, res) => {
  const data = await systemDataService.getAvailableProtocol(req)
  return responseData(res, data)
}

exports.checkIsExist = async (req, res) => {
  const total = await systemDataService.checkIsExist(req)
  return responseData(res, total)
}

exports.getUserByGroup = async (req, res) => {
  const [data, total] = await systemDataService.getUserByGroup(req)
  return responseDataWithTotal(res, total, data)
}

exports.updateUser = async (req, res) => {
  let result
  if (req.body.isCreate) {
    result = await systemDataService.createUser(req.body)
  } else {
    result = await systemDataService.updateUser(req.body)
  }
  return responseData(res, { result })
}

exports.updateUserAllowConsult = async (req, res) => {
  const result = await systemDataService.updateUserAllowConsult(req.body)
  return responseData(res, { result })
}

exports.deleteUser = async (req, res) => {
  const result = await systemDataService.deleteUser(req.query.userCode)
  return responseData(res, { result })
}

exports.createUser = async (req, res) => {
  const result = await systemDataService.createUser(req.body)
  return responseData(res, { result })
}

exports.getSysProperties = async (req, res) => {
  const [data, total] = await systemDataService.getSysProperties()
  return responseDataWithTotal(res, total, data)
}

exports.updateSysProperties = async (req, res) => {
  const result = await systemDataService.updateSysProperties(req.body)
  return responseData(res, { result })
}

exports.getAllUserGroup = async (req, res) => {
  const [data, total] = await systemDataService.getAllUserGroup()
  return responseDataWithTotal(res, total, data)
}

exports.updateUserGroup = async (req, res) => {
  const data = await systemDataService.updateUserGroup(req.body)
  return responseData(res, { result: data })
}

exports.deleteUserGroup = async (req, res) => {
  const result = await systemDataService.deleteUserGroup(req.query.id)
  return responseData(res, { result })
}

exports.createUserGroup = async (req, res) => {
  const data = await systemDataService.createUserGroup(req.body)
  return responseData(res, { result: data })
}

exports.getPermission = async (req, res) => {
  const data = await systemDataService.getPermission(req.query.id)
  return responseData(res, data)
}

exports.updatePermission = async (req, res) => {
  const data = await systemDataService.updatePermission(req.body)
  return responseData(res, { result: data })
}

exports.updateProtocol = async (req, res) => {
  let result
  if (req.body.isCreate) {
    result = await systemDataService.createProtocol(req.body)
  } else {
    result = await systemDataService.updateProtocol(req.body)
  }
  return responseData(res, { result })
}

exports.deleteProtocol = async (req, res) => {
  const result = await systemDataService.deleteProtocol(req.query.id)
  return responseData(res, { result })
}

exports.getProtocol = async (req, res) => {
  const [data, total] = await systemDataService.getProtocol(req)
  return responseDataWithTotal(res, total, data)
}

exports.getDefaultDateAndList = async (req, res) => {
  const [data, total] = await systemDataService.getDefaultDateAndList()
  return responseDataWithTotal(res, total, data)
}

exports.updateDefaultDateAndList = async (req, res) => {
  let result = await systemDataService.updateDefaultDateAndList(req.body)
  return responseData(res, { result })
}

exports.createFeedback = async (req, res) => {
  const data = await systemDataService.createFeedback(req.body)
  return responseData(res, { result: data })
}

exports.getFeedback = async (req, res) => {
  const [data, total] = await systemDataService.getFeedback(req)
  return responseDataWithTotal(res, total, data)
}
