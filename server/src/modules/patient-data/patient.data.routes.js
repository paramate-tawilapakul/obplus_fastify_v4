const patientDataController = require('./patient.data.controllers')

module.exports = function (fastify, opts, done) {
  fastify.post(
    '/create-order',
    { onRequest: [fastify.authenticate] },
    patientDataController.createOrder
  )
  fastify.post(
    '/patient-registration',
    { onRequest: [fastify.authenticate] },
    patientDataController.createPatient
  )
  fastify.get(
    '/patient-registration',
    { onRequest: [fastify.authenticate] },
    patientDataController.getPatientRegistrationByHN
  )
  fastify.get(
    '/template-data',
    { onRequest: [fastify.authenticate] },
    patientDataController.getTemplateData
  )

  done()
}
