const reportController = require('./report.controllers')

module.exports = function (fastify, opts, done) {
  fastify.get('/view', reportController.viewReport)

  fastify.get(
    '/id',
    { onRequest: [fastify.authenticate] },
    reportController.getReportId
  )
  fastify.get(
    '/content',
    { onRequest: [fastify.authenticate] },
    reportController.getReportContent
  )
  fastify.get(
    '/abnormal-content',
    { onRequest: [fastify.authenticate] },
    reportController.getAbnormalContent
  )
  fastify.post(
    '/content',
    { onRequest: [fastify.authenticate] },
    reportController.createReportContent
  )
  fastify.get(
    '/form',
    { onRequest: [fastify.authenticate] },
    reportController.getReportForm
  )
  fastify.post(
    '/diag',
    { onRequest: [fastify.authenticate] },
    reportController.updateDiagReport
  )
  fastify.get(
    '/diag',
    { onRequest: [fastify.authenticate] },
    reportController.getDiagReport
  )
  fastify.get(
    '/ga',
    { onRequest: [fastify.authenticate] },
    reportController.getAutoGaData
  )
  fastify.get(
    '/data',
    { onRequest: [fastify.authenticate] },
    reportController.getReportData
  )
  fastify.get(
    '/history',
    { onRequest: [fastify.authenticate] },
    reportController.getReportHistory
  )
  fastify.get(
    '/base64',
    { onRequest: [fastify.authenticate] },
    reportController.getImageBase64
  )
  fastify.get(
    '/server-time',
    { onRequest: [fastify.authenticate] },
    reportController.getServerTime
  )
  fastify.get(
    '/efw',
    { onRequest: [fastify.authenticate] },
    reportController.getEfwByHN
  )
  fastify.post(
    '/prelim',
    { onRequest: [fastify.authenticate] },
    reportController.prelimReport
  )
  fastify.post(
    '/verify',
    { onRequest: [fastify.authenticate] },
    reportController.verifyReport
  )
  fastify.post(
    '/content-value',
    { onRequest: [fastify.authenticate] },
    reportController.updateReportContentValue
  )

  done()
}
