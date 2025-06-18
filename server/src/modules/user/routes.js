const { addLogs, MODULE } = require('../logs/services')
const userController = require('./controllers')
const schema = require('./schema')
const { flagOnOff } = require('./services')

module.exports = function (fastify, opts, done) {
  fastify.get(
    '/',
    { schema: schema.userData, onRequest: [fastify.authenticate] },
    userController.getUserData
  )
  fastify.get('/license', { schema: schema.license }, userController.license)
  fastify.post('/signin', { schema: schema.userSignIn }, userController.login)
  fastify.get(
    '/signout',
    { schema: schema.userSignOut },
    // { onRequest: [fastify.authenticate] },
    async function (req, res) {
      // const url =
      //   process.env.NODE_ENV === 'production'
      //     ? `http://${request.headers.host}/${process.env.APP_NAME}/signin`
      //     : `http://localhost:3001/${process.env.APP_NAME}/signin`
      // console.log('url', url)
      // res.clearCookie('token').send({ message: 'Signed out' })
      // .send({ message: 'Signed out' })

      if (req.user) {
        await flagOnOff(req.user.id, '0')

        addLogs(req, {
          module: MODULE.USER,
          activity: 'Sign out',
        })
      }

      res.send({ message: 'sign out success' })
    }
  )

  fastify.get(
    '/report-template',
    {
      schema: schema.reportTemplate,
      onRequest: [fastify.authenticate],
    },
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
