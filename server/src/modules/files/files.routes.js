const filesUploadController = require('./files.controllers')

module.exports = function (fastify, opts, done) {
  fastify.get('/view', filesUploadController.view)
  fastify.get('/efw', filesUploadController.viewEfw)
  fastify.get('/backup-pdf', filesUploadController.viewBackupPdf)

  fastify.post(
    '/upload',
    { onRequest: [fastify.authenticate] },
    filesUploadController.upload
  )
  fastify.post(
    '/upload-dicom',
    { onRequest: [fastify.authenticate] },
    filesUploadController.uploadDicom
  )
  fastify.post(
    '/update-column',
    { onRequest: [fastify.authenticate] },
    filesUploadController.updateColumn
  )
  fastify.get(
    '/images',
    { onRequest: [fastify.authenticate] },
    filesUploadController.getImages
  )
  fastify.delete(
    '/images',
    { onRequest: [fastify.authenticate] },
    filesUploadController.deleteImage
  )
  fastify.delete(
    '/efw',
    { onRequest: [fastify.authenticate] },
    filesUploadController.deleteEFW
  )
  fastify.post(
    '/efw',
    { onRequest: [fastify.authenticate] },
    filesUploadController.uploadEFW
  )

  done()
}
