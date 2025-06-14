const teachingController = require('./teaching.controllers')

module.exports = function (fastify, opts, done) {
  fastify.get(
    '/folder',
    { onRequest: [fastify.authenticate] },
    teachingController.getTeachingFolder
  )
  fastify.post(
    '/folder',
    { onRequest: [fastify.authenticate] },
    teachingController.createTeachingFolder
  )
  fastify.put(
    '/folder',
    { onRequest: [fastify.authenticate] },
    teachingController.updateTeachingFolder
  )
  fastify.delete(
    '/folder',
    { onRequest: [fastify.authenticate] },
    teachingController.deleteTeachingFolder
  )
  fastify.post(
    '/files',
    { onRequest: [fastify.authenticate] },
    teachingController.createTeachingFiles
  )
  fastify.put(
    '/files',
    { onRequest: [fastify.authenticate] },
    teachingController.updateTeachingNote
  )
  fastify.patch(
    '/files',
    { onRequest: [fastify.authenticate] },
    teachingController.moveTeachingfiles
  )
  fastify.get(
    '/files',
    { onRequest: [fastify.authenticate] },
    teachingController.getTeachingFiles
  )
  fastify.put(
    '/note',
    { onRequest: [fastify.authenticate] },
    teachingController.updateTeachingNoteById
  )
  fastify.delete(
    '/note',
    { onRequest: [fastify.authenticate] },
    teachingController.deleteTeachingFiles
  )
  done()
}
