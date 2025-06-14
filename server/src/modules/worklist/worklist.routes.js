const worklistController = require('./worklist.controllers')

module.exports = function (fastify, opts, done) {
  fastify.get(
    '/auto-generate-order',
    { onRequest: [fastify.authenticate] },
    worklistController.autoGenerateOrder
  )

  fastify.get(
    '/',
    { onRequest: [fastify.authenticate] },
    worklistController.getWorklist
  )
  fastify.get(
    '/patient',
    { onRequest: [fastify.authenticate] },
    worklistController.getPatientOb
  )
  fastify.post(
    '/patient',
    { onRequest: [fastify.authenticate] },
    worklistController.updateObStudy
  )
  fastify.get(
    '/consultant',
    { onRequest: [fastify.authenticate] },
    worklistController.getConsultant
  )
  fastify.get(
    '/teaching-files',
    { onRequest: [fastify.authenticate] },
    worklistController.getTeachingWorklist
  )

  done()
}
