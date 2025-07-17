const systemDataController = require('./controllers')

module.exports = function (fastify, opts, done) {
  // fastify.addHook('onRequest', request => request.jwtVerify())
  fastify.get(
    '/patient-data',
    { onRequest: [fastify.authenticate] },
    systemDataController.getPatientRegisData
  )
  fastify.get(
    '/check-is-exist',
    { onRequest: [fastify.authenticate] },
    systemDataController.checkIsExist
  )
  fastify.get(
    '/user-by-group',
    { onRequest: [fastify.authenticate] },
    systemDataController.getUserByGroup
  )
  fastify.get(
    '/user-group',
    { onRequest: [fastify.authenticate] },
    systemDataController.getAllUserGroup
  )
  fastify.post(
    '/user-group',
    { onRequest: [fastify.authenticate] },
    systemDataController.createUserGroup
  )
  fastify.put(
    '/user-group',
    { onRequest: [fastify.authenticate] },
    systemDataController.updateUserGroup
  )
  fastify.delete(
    '/user-group',
    { onRequest: [fastify.authenticate] },
    systemDataController.deleteUserGroup
  )
  fastify.post(
    '/user',
    { onRequest: [fastify.authenticate] },
    systemDataController.updateUser
  )
  fastify.patch(
    '/user/allow-consult',
    { onRequest: [fastify.authenticate] },
    systemDataController.updateUserAllowConsult
  )
  fastify.delete(
    '/user',
    { onRequest: [fastify.authenticate] },
    systemDataController.deleteUser
  )
  fastify.get(
    '/permission',
    { onRequest: [fastify.authenticate] },
    systemDataController.getPermission
  )
  fastify.put(
    '/permission',
    { onRequest: [fastify.authenticate] },
    systemDataController.updatePermission
  )
  fastify.get(
    '/system-properties',
    { onRequest: [fastify.authenticate] },
    systemDataController.getSystemProperties
  )
  fastify.get(
    '/sys-properties',
    { onRequest: [fastify.authenticate] },
    systemDataController.getSysProperties
  )
  fastify.post(
    '/sys-properties',
    { onRequest: [fastify.authenticate] },
    systemDataController.updateSysProperties
  )
  fastify.get(
    '/locations',
    { onRequest: [fastify.authenticate] },
    systemDataController.getLocations
  )
  fastify.get(
    '/doctor',
    { onRequest: [fastify.authenticate] },
    systemDataController.getDoctor
  )
  fastify.get(
    '/time-guarantee',
    { onRequest: [fastify.authenticate] },
    systemDataController.getTimeGuarantee
  )
  fastify.get(
    '/default-date-list',
    { onRequest: [fastify.authenticate] },
    systemDataController.getDefaultDateAndList
  )
  fastify.put(
    '/default-date-list',
    { onRequest: [fastify.authenticate] },
    systemDataController.updateDefaultDateAndList
  )
  fastify.get(
    '/tag',
    { onRequest: [fastify.authenticate] },
    systemDataController.getMasterTags
  )
  fastify.get(
    '/indications',
    { onRequest: [fastify.authenticate] },
    systemDataController.getIndications
  )
  fastify.get(
    '/available-protocol',
    { onRequest: [fastify.authenticate] },
    systemDataController.getAvailableProtocol
  )
  fastify.get(
    '/protocol',
    { onRequest: [fastify.authenticate] },
    systemDataController.getProtocol
  )
  fastify.post(
    '/protocol',
    { onRequest: [fastify.authenticate] },
    systemDataController.updateProtocol
  )
  fastify.delete(
    '/protocol',
    { onRequest: [fastify.authenticate] },
    systemDataController.deleteProtocol
  )
  fastify.post(
    '/feedback',
    { onRequest: [fastify.authenticate] },
    systemDataController.createFeedback
  )
  fastify.get(
    '/feedback',
    { onRequest: [fastify.authenticate] },
    systemDataController.getFeedback
  )

  done()
}
