const userController = require('./user.controllers')

// const schema = {
//   querystring: {
//     type: 'object',
//     properties: {
//       name: { type: 'string' },
//       excitement: { type: 'integer' },
//     },
//   },
//   params: {
//     type: 'object',
//     properties: {
//       id: { type: 'string' },
//     },
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         message: { type: 'integer' },
//       },
//     },
//   },
// }

module.exports = function (fastify, opts, done) {
  fastify.get('/license', userController.license)
  fastify.post('/signin', userController.login)
  fastify.get('/signout', async function (req, res) {
    // const url =
    //   process.env.NODE_ENV === 'production'
    //     ? `http://${request.headers.host}/${process.env.APP_NAME}/signin`
    //     : `http://localhost:3001/${process.env.APP_NAME}/signin`
    // console.log('url', url)
    res.clearCookie('token').send({ message: 'Signed out' })
    // .send({ message: 'Signed out' })
  })

  fastify.get(
    '/',
    { onRequest: [fastify.authenticate] },
    userController.getUserData
  )
  fastify.get(
    '/report-template',
    { onRequest: [fastify.authenticate] },
    userController.getReportTemplate
  )
  fastify.post(
    '/report-template',
    { onRequest: [fastify.authenticate] },
    userController.updateReportTemplate
  )
  fastify.delete(
    '/report-template',
    { onRequest: [fastify.authenticate] },
    userController.deleteReportTemplate
  )
  fastify.put(
    '/report-template',
    { onRequest: [fastify.authenticate] },
    userController.cleanUpAllReportTemplate
  )
  fastify.post(
    '/change-password',
    { onRequest: [fastify.authenticate] },
    userController.changePassword
  )
  fastify.post(
    '/reset-password',
    { onRequest: [fastify.authenticate] },
    userController.resetPassword
  )

  done()
}
