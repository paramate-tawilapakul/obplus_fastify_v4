const systemDataService = require('./services')
const { responseDataWithTotal, responseData } = require('../../utils/utils')

exports.getPatientRegisData = async (req, res) => {
  const data = await systemDataService.getPatientRegisData(req.query.hn)
  responseData(res, data)
}

exports.getLocations = async (req, res) => {
  const [data, total] = await systemDataService.getLocations()
  responseDataWithTotal(res, total, data)
}

exports.getSystemProperties = async (req, res) => {
  const [data, total] = await systemDataService.getSystemProperties()
  const newData = { ...data, username: req.user.code }
  responseDataWithTotal(res, total, newData)
}

exports.getDoctor = async (req, res) => {
  const [data, total] = await systemDataService.getDoctor()
  responseDataWithTotal(res, total, data)
}

exports.getTimeGuarantee = async (req, res) => {
  const [data, total] = await systemDataService.getTimeGuarantee()
  responseDataWithTotal(res, total, data)
}

exports.getMasterTags = async (req, res) => {
  const data = await systemDataService.getMasterTags()
  responseData(res, data)
}

exports.getIndications = async (req, res) => {
  const data = await systemDataService.getIndications()
  responseData(res, data)
}

exports.getAvailableProtocol = async (req, res) => {
  const data = await systemDataService.getAvailableProtocol(req)
  responseData(res, data)
}

exports.checkIsExist = async (req, res) => {
  const total = await systemDataService.checkIsExist(req)
  responseData(res, total)
}

exports.getUserByGroup = async (req, res) => {
  const [data, total] = await systemDataService.getUserByGroup(req)
  responseDataWithTotal(res, total, data)
}

exports.updateUser = async (req, res) => {
  let result
  if (req.body.isCreate) {
    result = await systemDataService.createUser(req.body)
  } else {
    result = await systemDataService.updateUser(req.body)
  }
  responseData(res, { result })
}

exports.deleteUser = async (req, res) => {
  const result = await systemDataService.deleteUser(req.query.userCode)
  responseData(res, { result })
}

exports.createUser = async (req, res) => {
  const result = await systemDataService.createUser(req.body)
  responseData(res, { result })
}

exports.getSysProperties = async (req, res) => {
  const [data, total] = await systemDataService.getSysProperties()
  responseDataWithTotal(res, total, data)
}

exports.updateSysProperties = async (req, res) => {
  const result = await systemDataService.updateSysProperties(req.body)
  responseData(res, { result })
}

exports.getAllUserGroup = async (req, res) => {
  const [data, total] = await systemDataService.getAllUserGroup()
  responseDataWithTotal(res, total, data)
}

exports.updateUserGroup = async (req, res) => {
  const data = await systemDataService.updateUserGroup(req.body)
  responseData(res, { result: data })
}

exports.deleteUserGroup = async (req, res) => {
  const result = await systemDataService.deleteUserGroup(req.query.id)
  responseData(res, { result })
}

exports.createUserGroup = async (req, res) => {
  const data = await systemDataService.createUserGroup(req.body)
  responseData(res, { result: data })
}

exports.getPermission = async (req, res) => {
  const data = await systemDataService.getPermission(req.query.id)
  responseData(res, data)
}

exports.updatePermission = async (req, res) => {
  const data = await systemDataService.updatePermission(req.body)
  responseData(res, { result: data })
}

exports.updateProtocol = async (req, res) => {
  let result
  if (req.body.isCreate) {
    result = await systemDataService.createProtocol(req.body)
  } else {
    result = await systemDataService.updateProtocol(req.body)
  }
  responseData(res, { result })
}

exports.deleteProtocol = async (req, res) => {
  const result = await systemDataService.deleteProtocol(req.query.id)
  responseData(res, { result })
}

exports.getProtocol = async (req, res) => {
  const [data, total] = await systemDataService.getProtocol(req)
  responseDataWithTotal(res, total, data)
}

exports.getDefaultDateAndList = async (req, res) => {
  const [data, total] = await systemDataService.getDefaultDateAndList()
  responseDataWithTotal(res, total, data)
}

exports.updateDefaultDateAndList = async (req, res) => {
  let result = await systemDataService.updateDefaultDateAndList(req.body)
  responseData(res, { result })
}

exports.createFeedback = async (req, res) => {
  const data = await systemDataService.createFeedback(req.body)
  responseData(res, { result: data })
}

exports.getFeedback = async (req, res) => {
  const [data, total] = await systemDataService.getFeedback(req)
  responseDataWithTotal(res, total, data)
}
