const teachingService = require('./services')
const { responseDataWithTotal, responseData } = require('../../utils/utils')

exports.getTeachingFolder = async (req, res) => {
  const [data, total] = await teachingService.getTeachingFolder(req)
  responseDataWithTotal(res, total, data)
}

exports.createTeachingFolder = async (req, res) => {
  const data = await teachingService.createTeachingFolder(req)
  responseData(res, data)
}

exports.updateTeachingFolder = async (req, res) => {
  const data = await teachingService.updateTeachingFolder(req)
  responseData(res, data)
}

exports.deleteTeachingFolder = async (req, res) => {
  const data = await teachingService.deleteTeachingFolder(req)
  responseData(res, data)
}

exports.createTeachingFiles = async (req, res) => {
  const data = await teachingService.createTeachingFiles(req)

  responseData(res, data)
}

exports.getTeachingFiles = async (req, res) => {
  const [data, total] = await teachingService.getTeachingFiles(req)
  responseDataWithTotal(res, total, data)
}

exports.updateTeachingNote = async (req, res) => {
  const data = await teachingService.updateTeachingNote(req)
  responseData(res, data)
}

exports.updateTeachingNoteById = async (req, res) => {
  const data = await teachingService.updateTeachingNoteById(req)
  responseData(res, data)
}

exports.deleteTeachingFiles = async (req, res) => {
  const data = await teachingService.deleteTeachingFiles(req)
  responseData(res, data)
}

exports.moveTeachingfiles = async (req, res) => {
  const data = await teachingService.moveTeachingfiles(req)
  responseData(res, data)
}
