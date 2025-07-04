const initEnv = require('./dotenv').default
initEnv()

const schedule = require('node-schedule')
const { removeDir, removeEmptyDir, handleErrorLog } = require('./utils/utils')
const dayjs = require('dayjs')
const db = require('./db/setup')

const envToLogger = {
  development: {
    transport: {
      target: '@fastify/one-line-logger',
      // target: 'pino-pretty',
      // options: {
      //   translateTime: 'd/m/yyyy HH:MM:ss',
      //   ignore: 'hostname,reqId,req.remotePort,req.host',
      //   // colorize: true,
      //   // levelFirst: true,
      //   // messageFormat:
      //   //   '{req.method} {req.url} {req.headers.host} {res.statusCode} {responseTime}ms',
      // },
    },
  },
  production: {
    timestamp: () => `,"timestamp":"${new Date().toLocaleString('th-TH')}"`,
    formatters: {
      level: label => {
        return { level: label }
      },
    },
  },
  test: false,
}

const fastify = require('fastify')({
  ignoreTrailingSlash: true,
  bodyLimit: 1024 * 1024 * 100, //100MB
  logger: envToLogger[process.env.NODE_ENV || 'development'],
})

process.env.JWT_SECRET = 'be^9a@26e3e57c$478f&*88a4be7556ae#@!+^86e8'
process.env.ltk = 'T1fG$^7[esX@94T&YO0lvaC1SOBbqzC{E'

// fastify.register(require('@fastify/swagger'), {
//   openapi: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Swagger',
//       description: 'Fastify swagger API',
//       version: '0.1.0',
//     },
//     servers: [
//       {
//         url: 'http://localhost:6500',
//         description: 'Development server',
//       },
//     ],
//     tags: [{ name: 'user', description: 'User related end-points' }],
//     components: {
//       securitySchemes: {
//         bearer: {
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//           type: 'http',
//         },
//         // apiKey: {
//         //   type: 'apiKey',
//         //   name: 'apiKey',
//         //   in: 'header',
//         // },
//       },
//     },
//     security: [
//       {
//         // bearer: [],
//       },
//     ],
//     externalDocs: {
//       url: 'https://swagger.io',
//       description: 'Find more info here',
//     },
//   },
// })

// fastify.register(require('@fastify/swagger-ui'), {
//   routePrefix: '/documentation',
//   uiConfig: {
//     docExpansion: 'list',
//     deepLinking: false,
//   },
//   uiHooks: {
//     onRequest: function (req, res, next) {
//       next()
//     },
//     preHandler: function (req, res, next) {
//       next()
//     },
//   },
//   staticCSP: true,
//   transformStaticCSP: header => header,
//   transformSpecification: (swaggerObject, request, reply) => {
//     return swaggerObject
//   },
//   transformSpecificationClone: true,
// })

fastify.register(require('@fastify/cors'), {
  // put your options here
  origin: process.env.NODE_ENV === 'production' ? process.env.SERVER_IP : '*',
})

fastify.register(require('@fastify/multipart'), {
  // throwFileSizeLimit: true,
  limits: {
    // fieldNameSize: 100, // Max field name size in bytes
    // fieldSize: 100,     // Max field value size in bytes
    // fields: 10,         // Max number of non-file fields
    fileSize: 1024 * 1024 * 10, //10mb // For multipart forms, the max file size in bytes
    // files: 1,           // Max number of file fields
    // headerPairs: 2000,  // Max number of header key=>value pairs
    // parts: 1000         // For multipart forms, the max number of parts (fields + files)
  },
})

fastify.register(require('@fastify/rate-limit'), {
  global: true,
  max: 1000, // max requests
  timeWindow: 1000 * 60 * 15, // 15 minutes
})
fastify.register(require('@fastify/formbody'))

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET,
  // cookie: {
  //   cookieName: 'token',
  // },
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '16h',
  },
})

// fastify.register(require('@fastify/cookie'))

// fastify.addHook('preHandler', async (req, res) => {
//   try {
//     await req.jwtVerify()
//   } catch (err) {
//     res.send(err)
//   }
// })
// fastify.addHook('onRequest', req => req.jwtVerify())
// fastify.addHook('onRequest', async req => {
//   req.db = db
// })

fastify.decorate('authenticate', async function (req, res) {
  try {
    // await req.jwtVerify({ onlyCookie: true })
    await req.jwtVerify() //header and cookie if cookie plugin is active
  } catch (err) {
    res.send(err)
  }
})

fastify.addContentTypeParser(
  'application/json',
  { parseAs: 'string' },
  function (req, body, done) {
    try {
      var json = JSON.parse(body)
      done(null, json)
    } catch (err) {
      err.statusCode = 400
      done(err, undefined)
    }
  }
)

const prefixV1 = '/api/v1'

fastify.register(require('./modules/user/routes'), {
  prefix: `${prefixV1}/user`,
})
fastify.register(require('./modules/worklist/routes'), {
  prefix: `${prefixV1}/worklist`,
})
fastify.register(require('./modules/system-data/routes'), {
  prefix: `${prefixV1}/system-data`,
})
fastify.register(require('./modules/report/routes'), {
  prefix: `${prefixV1}/report`,
})
fastify.register(require('./modules/patient-data/routes'), {
  prefix: `${prefixV1}/patient-data`,
})
fastify.register(require('./modules/files/routes'), {
  prefix: `${prefixV1}/files`,
})
fastify.register(require('./modules/dicom-images/routes'), {
  prefix: `${prefixV1}/dicom-image`,
})
fastify.register(require('./modules/teaching/routes'), {
  prefix: `${prefixV1}/teaching`,
})

if (process.env.NODE_ENV === 'production') {
  const path = require('node:path')
  fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'client'),
  })

  const posibleRoutes = ['/', '/obplus', '/OBPLUS', '/obplus/*', '/OBPLUS/*']
  posibleRoutes.forEach(route => {
    fastify.get(route, function (req, res) {
      res.sendFile('index.html')
    })
  })
}

const port = process.env.SERVER_PORT || 3000
let serverIp = 'localhost'
if (
  process.env.SERVER_MODE === 'pm2' ||
  process.env.NODE_ENV === 'production'
) {
  // serverIp = process.env.SERVER_IP.split('//')[1]
  serverIp = '0.0.0.0'
}

fastify.listen(
  {
    port,
    host: serverIp,
  },
  err => {
    console.log(
      `${process.env.APP_NAME} ${
        process.env.NODE_ENV === 'production' ? '' : 'development'
      } server start on port ${port}`
    )
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
)

process.title = `${process.env.APP_NAME}`
const fileModule = 'server > index.js >'

const duration = parseInt(process.env?.DELETE_PDF_BACKUP || 365)
const logsOlderThan = parseInt(process.env?.DELETE_LOGS || 365)

// schedule.scheduleJob('*/5 * * * * *', async () => {
schedule.scheduleJob('0 0 * * *', () => {
  // run everyday at midnight

  // if (process.env.SERVER_MODE === 'PM2') {
  //   const pm2 = require('pm2')
  //   // let index = 0
  //   pm2.connect(function () {
  //     pm2.list(async (err, data) => {
  //       for (let i = 0; i < data.length; i++) {
  //         if (
  //           data[i].name === process.env.APP_NAME &&
  //           data[i].pm2_env.pm_id === 0 &&
  //           process.env.NODE_APP_INSTANCE === '0'
  //         ) {
  //           await deleteTempDicomImage()
  //           await deleteLogs()
  //           await deletePdfBackup()
  //         }
  //       }
  //       pm2.disconnect(function () {})
  //     })
  //   })
  // }
  Promise.all([deleteTempDicomImage(), deleteLogs(), deletePdfBackup()])
})

async function deleteTempDicomImage() {
  try {
    let tempAcc = await db.raw(`SELECT accession FROM OB_TEMPORARY_ACCESSION`)

    tempAcc = tempAcc.map(d => d.accession)
    for (let i = 0; i < tempAcc.length; i++) {
      let path = `${process.env.IMAGES_PATH}/${tempAcc[i]}/dicom`
      await removeDir(path)
    }
    for (let i = 0; i < tempAcc.length; i++) {
      let path = `${process.env.IMAGES_PATH}/${tempAcc[i]}`
      await removeEmptyDir(path)
    }

    await db.raw(`TRUNCATE TABLE OB_TEMPORARY_ACCESSION`)

    console.log(`schedule job every midnight > delete temporary dicom images `)
  } catch (error) {
    handleErrorLog(`${fileModule} deleteTempDicomImage(): ${error}`)
  }
}

async function deletePdfBackup() {
  try {
    const deleteDate = dayjs()
      .subtract(duration + 1, 'day')
      .format('YYYY-MM-DD')
      .split('-')

    const pathDelete = process.env.PDF_BACKUP_PATH

    let date = parseInt(deleteDate[2])
    let month = parseInt(deleteDate[1])
    let year = parseInt(deleteDate[0])

    for (let i = 1; i <= date; i++) {
      let str = i < 10 ? '0' + i : i
      let path = `${pathDelete}/${year}/${month}/${str}`
      await removeDir(path)
      // console.log(`delete date ${path}`)
    }

    for (let i = 1; i <= month - 1; i++) {
      let str = i < 10 ? '0' + i : i
      let path = `${pathDelete}/${year}/${str}`
      await removeDir(path)
      // console.log(`delete month ${path}`)
    }

    for (let i = year - 1; i >= year - 1; i--) {
      let path = `${pathDelete}/${i}`
      await removeDir(path)
      // console.log(`delete year ${path}`)
    }

    console.log(
      `schedule job every midnight > delete pdf backup older than ${duration} days`
    )
  } catch (error) {
    handleErrorLog(`${fileModule} deletePdfBackup(): ${error}`)
  }
}

async function deleteLogs() {
  try {
    const deleteDate =
      dayjs().subtract(logsOlderThan, 'day').format('YYYYMMDD') + '235959'

    await db('OB_LOGGER').del().where('timestamp', '<', deleteDate)

    console.log(
      `schedule job every midnight > delete logs older than ${logsOlderThan} days `
    )
  } catch (error) {
    handleErrorLog(`${fileModule} deleteLogs(): ${error}`)
  }
}
