const imageController = require('./controllers')

module.exports = function (fastify, opts, done) {
  fastify.get('/view', imageController.getAttachFile)
  fastify.get(
    '/',
    { onRequest: [fastify.authenticate] },
    imageController.getDicomImage
  )

  done()
}
