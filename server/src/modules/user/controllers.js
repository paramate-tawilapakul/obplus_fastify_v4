const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userService = require('./services')
const systemDataService = require('../system-data/services')
const { Logger, logFormat } = require('../../logger')
const { addLogs, MODULE } = require('../logs/services')
const { responseError, responseData } = require('../../utils/utils')

exports.license = async (req, res) => {
  try {
    const data = await systemDataService.getSystemProperties()

    let hspName = data[0].hspName
    let appName = process.env.APP_NAME

    // console.log('hspName', hspName)
    // console.log('appName', appName)

    const decoded = jwt.verify(process.env.LICENSE_KEY, process.env.ltk)
    // console.log('decoded', decoded)

    if (decoded.hspName === 'ALL') {
      return res.send({
        status: 200,
        message: 'License key is valid',
        decoded: { exp: decoded.exp },
      })
    }

    if (decoded.appName !== appName) {
      return res.send({
        status: 401,
        message: 'License key is invalid',
      })
    } else if (decoded.hspName !== hspName) {
      return res.send({
        status: 401,
        message: 'License key is invalid',
      })
    }

    return res.send({
      status: 200,
      message: 'License key is valid',
      decoded,
    })
  } catch (error) {
    console.error(error)
    res.send({
      status: 401,
      message: 'License expired',
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return responseError(res, 400, 'Please provide username and password')
    }

    const data = await userService.getUser(username)
    const userPassword = data[0]?.hashPassword || ''
    // if (userPassword.length > 30) {
    if (process.env.HASH_PASSOWRD === 'YES') {
      const compare = await bcrypt.compare(password, userPassword)
      if (!compare)
        return responseError(res, 400, 'Incorrect username or password')
    } else {
      if (userPassword !== password)
        return responseError(res, 400, 'Incorrect username or password')
    }

    delete data[0]?.hashPassword

    await userService.flagOnOff(data[0].id, '1')

    // if (process.env.SINGLE_LOGIN === 'YES') {
    //   await systemDataService.deleteOtherSession(username)
    //   await systemDataService.createSession(username, clientIP, timestamp)
    // }

    req['user'] = { code: data[0].code }

    addLogs(req, {
      module: MODULE.USER,
      activity: 'Sign in',
    })

    // const token = jwt.sign(data[0], process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // })

    const token = await res.jwtSign(data[0])

    // res
    //   .setCookie('token', token, {
    //     path: '/',
    //     secure: false, // send cookie over HTTPS only
    //     httpOnly: true,
    //     sameSite: true, // alternative CSRF protection
    //   })
    res.code(200).send({
      status: 'success',
      user: { ...data[0], token },
    })
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getUserData = async (req, res) => {
  const { code } = req.user
  if (!code) return responseError(res, 400, 'Please provide doctor code!')

  const data = await userService.getUserData(code)
  if (data.length === 0) return responseError(res, 404, 'User not found!')

  res.send({
    ...data[0],
    clientIP: req.ip,
  })
}

exports.resetPassword = async (req, res) => {
  const result = await userService.resetPassword(req)
  responseData(res, { result })
}

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword)
      return responseError(res, 400, 'Request error, no input data')

    const data = await userService.getUser(req.user.code)
    const userPassword = data[0]?.hashPassword || ''
    let hash = ''
    if (process.env.HASH_PASSOWRD === 'YES') {
      const compare = await bcrypt.compare(oldPassword, userPassword)
      if (!compare) return responseError(res, 200, 'Incorrect current password')

      hash = await bcrypt.hash(newPassword, 10)
    } else {
      if (userPassword !== oldPassword)
        return responseError(res, 200, 'Incorrect current password')
    }

    // if (data.length === 0)
    //   return responseError(res, 400, 'Incorrect current password')

    const result = await userService.changePassword({
      ...req,
      hashPassword: hash,
    })

    // const result = await userService.changePassword(req)

    addLogs(req, {
      module: MODULE.USER,
      activity: 'Change password',
    })

    res.send({
      status: result,
      msg: result ? 'Change password completed!' : 'Change password fail!',
    })
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getReportTemplate = async (req, res) => {
  const data = await userService.getReportTemplate(req)
  res.send({
    data,
  })
}

exports.updateReportTemplate = async (req, res) => {
  const data = await userService.updateReportTemplate(req)
  res.send({
    data,
  })
}

exports.deleteReportTemplate = async (req, res) => {
  const data = await userService.deleteReportTemplate(req)
  res.send({
    data,
  })
}

exports.cleanUpAllReportTemplate = async (req, res) => {
  const data = await userService.cleanUpAllReportTemplate(req)
  res.send({
    data,
  })
}
