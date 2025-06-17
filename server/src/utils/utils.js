const fs = require('graceful-fs')
const dayjs = require('dayjs')
const camelCase = require('lodash').camelCase
const { promisify } = require('node:util')
const duration = require('dayjs/plugin/duration')

dayjs.extend(duration)

const exists = promisify(fs.exists)
const mkdir = fs.promises.mkdir
const rm = fs.promises.rm
const readdir = fs.promises.readdir

function getServerTime() {
  return dayjs().format('YYYYMMDDHHmmss')
}

exports.getServerTime = getServerTime

exports.isEmptyObject = obj => Object.keys(obj).length === 0

exports.responseError = (res, status, message) =>
  res.code(status).send({ message })

exports.responseWorklistResult = (res, total, data) => {
  res.send({
    total,
    currentResultTotal: data.length,
    data,
    serverTime: getServerTime(),
  })
}

exports.responseDataWithTotal = (res, total = 0, data) => {
  res.send({
    total,
    data,
  })
}

exports.responseData = (res, data) => {
  res.send({
    data,
  })
}

function getYearMonthDay() {
  const timestamp = dayjs().format('YYYYMMDDHHmmss')
  const year = timestamp.substring(0, 4)
  const month = timestamp.substring(4, 6)
  const day = timestamp.substring(6, 8)
  return [year, month, day]
}

exports.mkPdfBackupPath = async (year, month, day) => {
  try {
    let y, m, d
    if (year && month && day) {
      y = year
      m = month
      d = day
    } else {
      const [year, month, day] = getYearMonthDay()
      y = year
      m = month
      d = day
    }
    let dir = `${process.env.PDF_BACKUP_PATH}/${y}/${m}/${d}`
    let isExist = await exists(dir)
    if (!isExist) {
      await mkdir(dir, { recursive: true })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.mkImagePath = async accession => {
  try {
    let dir = `${process.env.IMAGES_PATH}/${accession}`
    let isExist = await exists(dir)
    if (!isExist) {
      await mkdir(dir, { recursive: true })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.mkEFWPath = async (accession, fetusNo) => {
  try {
    let dir = `${process.env.IMAGES_PATH}/efw/${accession}/${fetusNo}`
    let isExist = await exists(dir)
    if (!isExist) {
      await mkdir(dir, { recursive: true })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.mkImageDicomPath = async accession => {
  try {
    let dir = `${process.env.IMAGES_PATH}/${accession}/dicom`
    let isExist = await exists(dir)
    if (!isExist) {
      await mkdir(dir, { recursive: true })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.dateToDBformat = date => {
  if (!date) return

  const [d, m, y] = date.split('/')
  return `${y}${m}${d}`
}

exports.modalityToStrQuery = modality => {
  if (!modality) return

  const modalArr = modality.split(',')
  let modalStr = ''

  modalArr.forEach(m => {
    modalStr += `'${m}',`
  })

  return modalStr.slice(0, -1)
}

//Only datetime format = YYYYMMDDHHmmss return DD/MM/YYYY HH:mm:ss
exports.reFormatFullDate = date => {
  if (!date) return

  return `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(
    0,
    4
  )} ${date.substring(8, 10)}:${date.substring(10, 12)}:${date.substring(
    12,
    14
  )}`
}

//Only datetime format = YYYYMMDDHHmmss return DD/MM/YYYY
exports.reFormatDateFromTimestamp = date => {
  if (!date) return

  return `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(
    0,
    4
  )}`
}

//Only datetime format = YYYYMMDDHHmmss return HH:mm:ss
exports.reFormatTimeFromTimestamp = date => {
  if (!date) return

  return `${date.substring(8, 10)}:${date.substring(10, 12)}:${date.substring(
    12,
    14
  )}`
}

exports.formatDateTimeMsec = datetime => {
  if (!datetime) return
  // ex. 26/12/2017 12:43:36 -> millisecond
  const [d, t] = datetime.split(' ')
  const dd = d.split('/')
  const tt = t.split(':')

  return dayjs(`${dd[2]}${dd[1]}${dd[0]} ${tt[0]}${tt[1]}${tt[2]}`).valueOf()
}

exports.msecToMin = msec => {
  if (isNaN(msec)) return

  return msec / 1000 / 60
}

exports.reformatPath = path => {
  if (!path) return

  let pathName = path.replace(/\\\\/g, '/')
  pathName = pathName.split('/')
  pathName.pop()
  pathName = pathName.join('/')

  return pathName
}

exports.objectArrayToCamel = originalObjectArray => {
  if (!Array.isArray(originalObjectArray)) return []

  const cloneObj = [...originalObjectArray]

  let newObj = []
  cloneObj.forEach(element => {
    let nn = {}
    Object.keys(element).forEach(key => {
      nn[camelCase(key)] = element[key]
    })
    newObj.push(nn)
  })
  return newObj
}

exports.capitalizeFirstLetter = string => {
  // return string.charAt(0).toUpperCase() + string.slice(1)
  return string[0].toUpperCase() + string.slice(1)
}

exports.lastElementOfArray = array => {
  return array[array.length - 1] || ''
}

exports.objNullToEmpty = (obj = {}) => {
  let newObj = {}
  Object.keys(obj).forEach(key => {
    if (!obj[key]) {
      newObj[key] = ''
    } else {
      newObj[key] = obj[key]
    }
  })

  return newObj
}

exports.calculateAge = dob => {
  if (!dob) return '-'

  let duration = dayjs.duration(dayjs().diff(dob))
  let years = duration.years()
  let months = duration.months()
  let days = duration.days()
  let result = `${years}Y ${months}M ${days}D`
  return result
}

//Only datetime format = DD/MM/YYYY HH:mm:ss return YYYYMMDDHHmmss
exports.reFormatFullDateToDbFormat = date => {
  if (!date || date.length !== 19) {
    console.log('only format DD/MM/YYYY HH:mm:ss')
    return ''
  }

  return `${date.substring(6, 10)}${date.substring(3, 5)}${date.substring(
    0,
    2
  )}${date.substring(11, 13)}${date.substring(14, 16)}${date.substring(17, 19)}`
}

exports.isEnglish = str => {
  if (!str) return

  // str = str.replace(/[^a-zA-Z0-9]/g, '')
  // console.log(str)
  return /^[A-Za-z0-9.!@#$%&*()-_ ,]*$/i.test(str)
}

exports.getClientIP = req => {
  return req.ip
}

exports.reFormatFullPath = path => {
  if (!path) return ''

  return path.replace(/\\\\/g, '/').replace('//', '/')
}

exports.getIPAddress = () => {
  const interfaces = require('os').networkInterfaces()
  for (let devName in interfaces) {
    const iface = interfaces[devName]

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i]
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      )
        return alias.address
    }
  }
  return '0.0.0.0'
}

exports.stripQuote = (obj = {}) => {
  let newObj = {}
  Object.keys(obj).forEach(key => {
    newObj[key] = obj[key].replace(/'/g, '')
    newObj[key] = newObj[key].replace(/;/g, '')
  })

  return newObj
}

function removeClass(content) {
  const regex = /class="[a-zA-Z0-9:;.\s()\-,]*"/gm
  let m
  let newContent = content
  while ((m = regex.exec(content)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    newContent = newContent.replace(m[0], '')
  }

  return newContent
}

function removeDataAtr(content) {
  const regex = /data-(\S+)="((?:\\.|[^"\\])*)"/gm
  const regex2 = /xml:lang="((?:\\.|[^"\\])*)"/gm
  const regex3 = /lang="((?:\\.|[^"\\])*)"/gm

  let m
  let newContent = content
  while ((m = regex.exec(newContent)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    newContent = newContent.replace(m[0], '')
  }

  while ((m = regex2.exec(newContent)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex2.lastIndex) {
      regex2.lastIndex++
    }

    newContent = newContent.replace(m[0], '')
  }

  while ((m = regex3.exec(newContent)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex3.lastIndex) {
      regex3.lastIndex++
    }

    newContent = newContent.replace(m[0], '')
  }

  return newContent
}

function removeFontFamily(content) {
  const regex = /(?<=;|"|\s)font-family:[^;']*(;)?/gm
  let m
  let newContent = content
  while ((m = regex.exec(content)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    newContent = newContent.replace(m[0], '')
  }

  return newContent
}

function checkTableAndNoRoot(content) {
  let newContent = content
  if (newContent.indexOf('</table>') > 0) {
    // console.log('has table')
    const testLine = newContent.split('\n')
    let hasNoRoot = false
    for (let i = 0; i < testLine.length; i++) {
      const t = testLine[i].trim()
      if (!t.startsWith('<') || t.startsWith('<br')) {
        // console.log('detect no root -> ', t, i)
        hasNoRoot = true
        // console.log('change to ->', `<p>${t}</p>`)
        testLine[i] = `<p>${t}</p>`
      }
    }

    if (hasNoRoot) newContent = testLine.join('')
  }
  return newContent
}

function replacePwithBR(content) {
  if (!content) return ''
  let newContent = content.trim()

  newContent = newContent.replace(/<p[^>]*>?/gm, '<br />')
  newContent = newContent.replace(/<\/p>/gm, '')

  if (newContent.slice(0, 6) === '<br />') {
    newContent = newContent.slice(6)
  } else if (newContent.slice(0, 4) === '<br>') {
    newContent = newContent.slice(4)
  }

  return newContent
}

exports.replacePwithBR = replacePwithBR

function reFormatSpace(content) {
  if (!content) return ''
  // console.log(content)
  let newContent = content.replace(/\|/g, '')
  newContent = newContent.replace(/&nbsp;&nbsp;/g, `&nbsp; `)

  let checkStartP1 = newContent.trim().slice(0, 3) //<p>
  let checkStartP2 = newContent.trim().slice(0, 2) //<p

  if (
    checkStartP1.toLowerCase() === '<p>' ||
    checkStartP2.toLowerCase() === '<p'
  )
    return newContent

  return `<p>${newContent}</p>`
}

exports.reFormatSpace = reFormatSpace

function cleanUpContent(content) {
  let newContent = content

  newContent = removeDataAtr(newContent)
  newContent = removeClass(newContent)

  newContent = removeFontFamily(newContent)

  newContent = newContent.replace(/>HIS</gm, '><')
  newContent = newContent.replace(/<div[^>]*>?/gm, '')
  newContent = newContent.replace(/<\/div>/gm, '')

  newContent = newContent.replace(/<a[^>]*>?/gm, '')
  newContent = newContent.replace(/<\/a>/gm, '')

  if (newContent.indexOf('</h') > 0) {
    // console.log('has H tag')
    newContent = newContent.replace(/<h1[^>]*>?/gm, '<strong>')
    newContent = newContent.replace(/<\/h1>/gm, '</strong>')
    newContent = newContent.replace(/<h2[^>]*>?/gm, '<strong>')
    newContent = newContent.replace(/<\/h2>/gm, '</strong>')
    newContent = newContent.replace(/<h3[^>]*>?/gm, '<strong>')
    newContent = newContent.replace(/<\/h3>/gm, '</strong>')
    newContent = newContent.replace(/<h4[^>]*>?/gm, '<strong>')
    newContent = newContent.replace(/<\/h4>/gm, '</strong>')
    newContent = newContent.replace(/<h5[^>]*>?/gm, '<strong>')
    newContent = newContent.replace(/<\/h5>/gm, '</strong>')
    newContent = newContent.replace(/<h6[^>]*>?/gm, '<strong>')
    newContent = newContent.replace(/<\/h6>/gm, '</strong>')
  }

  newContent = newContent.replace(/<p><\/p>/gm, '')
  newContent = checkTableAndNoRoot(newContent)

  return newContent
}

exports.cleanUpContent = cleanUpContent

function genImageArr(arr, accession) {
  return arr.map(n => ({
    name: n.name,
    src: `/api/v1/files/view?name=${
      n.name
    }&accession=${accession}&r=${Math.random()}`,
    cols: n.cols,
  }))
}

exports.genImageArr = genImageArr

async function removeDir(path) {
  try {
    // console.log('Delete ', path)
    let isExist = await exists(path)
    if (isExist) {
      await rm(path, { recursive: true, force: true })
    }
  } catch (error) {
    console.log(error)
  }
}

exports.removeDir = removeDir

async function removeEmptyDir(path) {
  try {
    // console.log('Delete ', path)
    let isExist = await exists(path)
    if (isExist) {
      let files = await readdir(path)
      if (files.length === 0) {
        await rm(path, { recursive: true, force: true })
      }
    }
  } catch (error) {
    console.log(error)
  }
}

exports.removeEmptyDir = removeEmptyDir
