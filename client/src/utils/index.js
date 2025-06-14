import moment from 'moment'
import camelCase from 'lodash/camelCase'
import isObjectLike from 'lodash/isObjectLike'
import forOwn from 'lodash/forOwn'
// import reduce from 'image-blob-reduce'
import { APP_CONFIG, APP_ROUTES, STORAGE_NAME } from '../config'

// Only datetime format = YYYYMMDD HHmmss
export const convertDateTimeFormat = (datetime, format) =>
  datetime &&
  typeof datetime === 'string' &&
  (datetime.length === 15 || datetime.length === 8) &&
  typeof format === 'string'
    ? moment(datetime).format(format)
    : ''

//Only datetime format = YYYYMMDDHHmmss return [date,time]
export const reFormatFullDate = date => {
  if (!date) return ['-', '-']

  return [
    `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(0, 4)}`,
    `${date.substring(8, 10)}:${date.substring(10, 12)}:${date.substring(
      12,
      14
    )}`,
  ]
}

//Only datetime format = DD/MM/YYYY HH:mm:ss return YYYYMMDDHHmmss
export const reFormatFullDateToDbFormat = date => {
  if (!date || date.length !== 19) {
    console.log('only format DD/MM/YYYY HH:mm:ss')
    return ''
  }

  return `${date.substring(6, 10)}${date.substring(3, 5)}${date.substring(
    0,
    2
  )}${date.substring(11, 13)}${date.substring(14, 16)}${date.substring(17, 19)}`
}

//Only datetime format = DD/MM/YYYY return YYYYMMDD
export const reFormatDateToDbFormat = date => {
  if (!date || date.length !== 10) {
    // console.log('only format DD/MM/YYYY')
    return ''
  }

  return `${date.substring(6, 10)}${date.substring(3, 5)}${date.substring(
    0,
    2
  )}`
}

export const reFormatDate = date => {
  if (!date) return ''

  return `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(
    0,
    4
  )}`
}

// return yyyy-mm-dd
export const reFormatDate2 = date => {
  if (!date) return ''

  return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(
    6,
    8
  )}`
}

export const reFormatDateMMDDYYYY = date => {
  if (!date) return ''

  return `${date.substring(4, 6)}/${date.substring(6, 8)}/${date.substring(
    0,
    4
  )}`
}

export const reFormatTime = time => {
  if (!time) return ''

  return `${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(
    4,
    6
  )}`
}

export const convertPriority = (priorityId, priorityList = []) => {
  if (!priorityId.match(/[0-6]/g)) return 'Unknown'

  return priorityList[parseInt(priorityId)]?.name
}

export const calculateAge = (dob, timestampReported = '') => {
  if (!dob) return '-'

  // console.log('timestampReported', timestampReported)
  // console.log(moment.duration(moment('20210506').diff(dob)).years())

  let dDif = !timestampReported
    ? moment().diff(dob)
    : moment(timestampReported).diff(dob)

  let duration = moment.duration(dDif)
  let years = duration.years()
  // let months = duration.months()
  // let days = duration.days()
  // let result = `${years}Y ${months}M ${days}D`
  let result = `${years}Y`
  return result
}

export function getShowPublic() {
  let showPublic = true
  if (window.localStorage.getItem(STORAGE_NAME.showPublicTemplate)) {
    if (window.localStorage.getItem(STORAGE_NAME.showPublicTemplate) === '0') {
      showPublic = false
    }
  }

  return showPublic
}

export const convertGender = gender => {
  if (!gender) return 'Unknown'

  let genderName
  switch (gender) {
    case 'F':
      genderName = 'Female'
      break
    case 'M':
      genderName = 'Male'
      break
    default:
      genderName = 'Unknown'
      break
  }

  return genderName
}

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// export const getBase64FromUrl = async (url, editorRef) => {
//   try {
//     const data = await fetch(url)
//     const blob = await data.blob()
//     // console.log(blob)
//     const resizedBlob = await reduce().toBlob(blob, { max: 3 })
//     // console.log(resizeBlob)
//     return new Promise(resolve => {
//       const reader = new FileReader()
//       reader.readAsDataURL(resizedBlob)
//       reader.onloadend = () => {
//         const base64data = reader.result
//         resolve(base64data)
//       }
//     })
//   } catch (error) {
//     console.log(error)
//     alert(
//       'Error : Your IP has been blocked by CORS policy.\nPlease paste in MS Word or local machine then Copy & Paste again'
//     )
//     editorRef.current.undoManager.undo()
//   }
// }

export function tranformHTML(html) {
  let newHtml = []
  html.forEach(node => {
    if (node.nodeName) {
      if (node.nodeName === 'P' || node.nodeName === 'p') {
        node.margin = [0, 1, 0, 1] //left,top,right,bottom
      } else if (
        node.nodeName.startsWith('H') ||
        node.nodeName.startsWith('h')
      ) {
        node.marginBottom = 8
      }
      newHtml.push(node)
    }
  })

  return newHtml
}

// export function cleanUpContent(content, from = null) {
//   // console.log('cleanUpContent', from)
//   let newContent = content

//   // if (from === 'template') {
//   //   // console.log('remove class and attribute')
//   //   newContent = removeDataAtr(newContent)
//   //   newContent = removeClass(newContent)
//   // }

//   newContent = removeFontFamily(newContent)

//   newContent = newContent.replace(/>HIS</gm, '><')
//   newContent = newContent.replace(/<div[^>]*>?/gm, '')
//   newContent = newContent.replace(/<\/div>/gm, '')

//   newContent = newContent.replace(/<a[^>]*>?/gm, '')
//   newContent = newContent.replace(/<\/a>/gm, '')

//   if (newContent.indexOf('</h') > 0) {
//     // console.log('has H tag')
//     newContent = newContent.replace(/<h1[^>]*>?/gm, '<strong>')
//     newContent = newContent.replace(/<\/h1>/gm, '</strong>')
//     newContent = newContent.replace(/<h2[^>]*>?/gm, '<strong>')
//     newContent = newContent.replace(/<\/h2>/gm, '</strong>')
//     newContent = newContent.replace(/<h3[^>]*>?/gm, '<strong>')
//     newContent = newContent.replace(/<\/h3>/gm, '</strong>')
//     newContent = newContent.replace(/<h4[^>]*>?/gm, '<strong>')
//     newContent = newContent.replace(/<\/h4>/gm, '</strong>')
//     newContent = newContent.replace(/<h5[^>]*>?/gm, '<strong>')
//     newContent = newContent.replace(/<\/h5>/gm, '</strong>')
//     newContent = newContent.replace(/<h6[^>]*>?/gm, '<strong>')
//     newContent = newContent.replace(/<\/h6>/gm, '</strong>')
//   }

//   // MNST REMOVE TABLE
//   // if (from === 'HIS') {
//   //   newContent = newContent.replace(/<table[^>]*>?/gm, '')
//   //   newContent = newContent.replace(/<tbody[^>]*>?/gm, '')
//   //   newContent = newContent.replace(/<tr[^>]*>?/gm, '')
//   //   newContent = newContent.replace(/<td[^>]*>?/gm, '')
//   //   newContent = newContent.replace(/<\/table>/gm, '')
//   //   newContent = newContent.replace(/<\/tbody>/gm, '')
//   //   newContent = newContent.replace(/<\/tr>/gm, '')
//   //   newContent = newContent.replace(/<\/td>/gm, '')
//   // }

//   // newContent = parseImage64(newContent)
//   newContent = newContent.replace(/<p><\/p>/gm, '')
//   newContent = checkTableAndNoRoot(newContent)

//   return newContent
// }

// export function checkTableAndNoRoot(content) {
//   let newContent = content
//   if (newContent.indexOf('</table>') > 0) {
//     // console.log('has table')
//     const testLine = newContent.split('\n')
//     let hasNoRoot = false
//     for (let i = 0; i < testLine.length; i++) {
//       const t = testLine[i].trim()
//       if (!t.startsWith('<') || t.startsWith('<br')) {
//         // console.log('detect no root -> ', t, i)
//         hasNoRoot = true
//         // console.log('change to ->', `<p>${t}</p>`)
//         testLine[i] = `<p>${t}</p>`
//       }
//     }

//     if (hasNoRoot) newContent = testLine.join('')
//   }
//   return newContent
// }

// export function removeFontFamily(content) {
//   // console.log(content)
//   const regex = /(?<=;|"|\s)font-family:[^;']*(;)?/gm
//   let m
//   let newContent = content
//   while ((m = regex.exec(content)) != null) {
//     // This is necessary to avoid infinite loops with zero-width matches
//     if (m.index === regex.lastIndex) {
//       regex.lastIndex++
//     }

//     newContent = newContent.replace(m[0], '')
//   }

//   return newContent
// }

// export function reFormatSpace(content) {
//   if (!content) return ''
//   // console.log(content)
//   let newContent = content.replace(/\|/g, '')
//   newContent = newContent.replace(/&nbsp;&nbsp;/g, `&nbsp; `)

//   let checkStartP1 = newContent.trim().slice(0, 3) //<p>
//   let checkStartP2 = newContent.trim().slice(0, 2) //<p

//   if (
//     checkStartP1.toLowerCase() === '<p>' ||
//     checkStartP2.toLowerCase() === '<p'
//   )
//     return newContent

//   return `<p>${newContent}</p>`
// }

// export function reFormatSpaceAddendum(content) {
//   if (!content) return ''

//   let newContent = content.replace(/\|/g, '')
//   newContent = newContent.replace(/&nbsp;&nbsp;/g, `&nbsp; `)

//   return newContent
// }

export function handleErrorResponse(response) {
  if (response?.status >= 500) {
    alert('Server error...')
    // window.location.href = `/${APP_CONFIG.APP_NAME}`
    window.location.reload()
  }
  if (response?.status === 401) {
    // alert('Token invalid or expired!, please Sign in ...')
    window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
  }
  if (response?.status === 400) {
    // don't change response.data.message
    if (
      response.data.message !== 'Incorrect current password' &&
      response.data.message !== 'Request error, no input data'
    ) {
      alert(response.data.message)
      // window.location.href = `/${APP_CONFIG.APP_NAME}`
      window.location.reload()
    }
  }

  // if (response.status === 413) {
  //   alert(response.data.message)
  //   // window.location.href = `/${APP_CONFIG.APP_NAME}`
  // }
}

export function objectArrayToCamel(originalObjectArray, options = undefined) {
  if (!Array.isArray(originalObjectArray)) return []

  const cloneObj = [...originalObjectArray]

  let newObj = []
  cloneObj.forEach((element, index) => {
    let nn = {}
    Object.keys(element).forEach(key => {
      nn['id'] = index
      nn[camelCase(key)] = element[key]
    })

    if (options) {
      newObj.push({ ...nn, ...options })
    } else {
      newObj.push(nn)
    }
  })

  return newObj
}

export function setMultipleChoice(name, value, setState, masterValue = []) {
  if (value.length === 0) return setState(prev => ({ ...prev, [name]: [] }))

  if (value[0] === 'All' && value.length > 1 && value[1] !== 'All') {
    let newArray = [...masterValue]
    newArray.splice(masterValue.indexOf(value[1]), 1)
    setState(prev => ({ ...prev, [name]: newArray }))
  } else if (value[0] === 'All' || value[value.length - 1] === 'All') {
    setState(prev => ({ ...prev, [name]: ['All'] }))
  } else {
    setState(prev => ({ ...prev, [name]: value }))
  }
}

export function isValidInput(data = [], needValid = []) {
  let message = ''
  let inValidInput = []
  let inValidDate = []
  needValid.push('dateFrom', 'dateTo')

  for (let i = 0; i < data.length; i++) {
    if (needValid.includes(data[i].name)) {
      if (data[i].name === 'dateFrom' || data[i].name === 'dateTo') {
        // console.log(reFormatDateToDbFormat(data[i].value))
        if (data[i].value !== '' && data[i].value.length !== 10) {
          inValidDate.push(data[i].name)
        }
      } else if (!data[i].value) {
        inValidInput.push(data[i].name)
      }
    }
  }

  if (inValidInput.length > 0) {
    const msg = inValidInput
      .map(i => toCapitalize(i))
      .join(', ')
      .toString()

    message = `[ ${msg} ] is required`
  }

  if (inValidDate.length > 0) {
    const msg = inValidDate
      .map(i => toCapitalize(i))
      .join(', ')
      .toString()

    message += `Invalid format [ ${msg} ] `
  }

  const testDate = data.filter(
    d => d.name === 'dateFrom' || d.name === 'dateTo'
  )

  if (testDate[0].value || testDate[1].value) {
    if (!testDate[0].value || !testDate[1].value) {
      inValidDate.push(`${testDate[0].name}, ${testDate[1].name}`)
      const msg = inValidDate
        .map(i => toCapitalize(i))
        .join(', ')
        .toString()
      message += `[ ${msg} ] are required`
    }
  }

  let [d1, d2] = ['', '']
  if (testDate[0].value && testDate[1].value) {
    d1 = reFormatDateToDbFormat(testDate[0].value)
    d2 = reFormatDateToDbFormat(testDate[1].value)

    if (d1 > d2) {
      inValidDate.push(`${testDate[0].name}, ${testDate[1].name}`)
      const msg = inValidDate
        .map(i => toCapitalize(i))
        .join(', ')
        .toString()

      message += `Invalid [ ${msg} ]`
    }
  }

  return {
    isValid: inValidInput.length === 0 && inValidDate.length === 0,
    message,
  }
}

export function toCapitalize(str) {
  if (!str) return

  const arr = str.split(' ')

  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
  }

  return arr.join(' ')
}

export function formDataToObject(formData = []) {
  let newObj = {}
  formData.forEach(form => {
    if (form.name) newObj[form.name] = form.value?.trim()
  })

  return newObj
}

export function formDataToObject2(formData = []) {
  let newObj = {}
  let key = ''
  let masterKey = ''
  formData.forEach(form => {
    key = form.name
    if (form.type === 'checkbox') {
      masterKey = form.name
      newObj[key] = {
        type: 'T',
        value: form.checked ? form.dataset.value : '',
        name: form.dataset.name,
      }
    } else {
      if (
        form.type === 'text' &&
        (form.dataset.mastername || form.dataset.name)
      ) {
        // console.log(form.type, form.dataset.name)
        newObj[key] = {
          type: 'T',
          value: form.value,
          name: form.dataset.mastername || form.dataset.name,
          unit: form.dataset.unit,
        }
      } else if (form.name === '271') {
        newObj[key] = {
          type: 'T',
          value: form.value,
          name: form.name,
        }
      }
    }

    if (newObj[masterKey]?.value) {
      if (key.split('-')[1] === 'option') {
        if (form.type === 'checkbox') {
          newObj[masterKey] = {
            ...newObj[masterKey],
            value: form.checked ? form.dataset.value : '',
          }
        } else {
          if (form.value) {
            newObj[masterKey] = {
              ...newObj[masterKey],
              value: newObj[masterKey].value + '-' + form.value,
            }
          }
        }
      }

      if (key.split('-')[1] === 'text') {
        if (form.value) {
          if (newObj[masterKey].value.indexOf('x') === -1) {
            let textArr = formData
              .filter(form => {
                return form.name.startsWith(`${masterKey}-text`)
              })
              .map(form => form.value)

            newObj[masterKey] = {
              ...newObj[masterKey],
              value:
                newObj[masterKey].value +
                '-' +
                textArr
                  .map((value, i) => {
                    if (i === 2) return value + ' mm'
                    return value
                  })
                  .join('x'),
            }
          }
        }
      }
    }
  })

  return newObj
}

export function formDataToObject3(formData = []) {
  let newObj = {}
  let key = ''
  let masterKey = ''
  formData.forEach(form => {
    key = form.name
    // console.log(form.name)
    if (form.type === 'checkbox') {
      masterKey = form.name
      newObj[key] = {
        type: 'T',
        value: form.checked ? form.dataset.value : '',
        name: form.dataset.name,
      }
    } else if (form.dataset.master === 'yes') {
      masterKey = form.name
      newObj[key] = {
        type: 'T',
        value: form.value,
        name: form.dataset.name,
        master: 'yes',
      }
    }

    if (newObj[masterKey]?.value) {
      if (key.split('-')[1] === 'option') {
        if (form.value) {
          // console.log(form.value)
          newObj[masterKey] = {
            ...newObj[masterKey],
            value: newObj[masterKey].value + '-' + form.value,
          }
        }
      }

      if (key.split('-')[1] === 'text') {
        if (form.value) {
          if (newObj[masterKey].value.indexOf('x') === -1) {
            let textArr = formData
              .filter(form => {
                return form.name.startsWith(`${masterKey}-text`)
              })
              .map(form => form.value)

            newObj[masterKey] = {
              ...newObj[masterKey],
              value:
                newObj[masterKey].value +
                '-' +
                textArr
                  .map((value, i) => {
                    if (i === 2) return value + ' mm'
                    return value
                  })
                  .join('x'),
            }
          }
        }
      }
    }
  })

  return newObj
}

export function formDataToObject4(formData = []) {
  let newObj = {}
  let key = ''
  let masterKey = ''
  formData.forEach(form => {
    key = form.name
    if (form.type === 'checkbox') {
      masterKey = form.name
      newObj[key] = {
        type: 'T',
        value: form.checked ? form.dataset.value : '',
        name: form.dataset.name,
      }
    }

    if (newObj[masterKey]?.value) {
      if (key.split('-')[1] === 'option') {
        if (form.value) {
          // console.log(form.value)
          newObj[masterKey] = {
            ...newObj[masterKey],
            value: newObj[masterKey].value + '-' + form.value,
          }
        } else {
          newObj[masterKey] = {
            ...newObj[masterKey],
            value: newObj[masterKey].value + '-',
          }
        }
      }
    }
  })

  return newObj
}

export function replaceAllWithEmpty(obj = {}, allUserLocation) {
  // console.log(obj)
  let newObj = {}
  Object.keys({ ...obj }).forEach(key => {
    newObj[key] = obj[key]
    if (obj[key] === 'All') {
      newObj[key] = ''
    }
  })

  if (newObj['location'] === '') {
    newObj['location'] = allUserLocation
  }

  return newObj
}

export function deepFreeze(objects = []) {
  objects.forEach(obj => {
    if (!isObjectLike(obj)) {
      return
    }

    Object.freeze(obj)

    forOwn(obj, function (value) {
      if (!isObjectLike(value) || Object.isFrozen(value)) {
        return
      }

      deepFreeze(value)
    })
  })
}

export function timeDuration(
  assignDate = '',
  format = 'DHM',
  serverTime = undefined
) {
  if (!assignDate || assignDate.length !== 14) return

  const date = assignDate.substring(0, 8)
  const time = assignDate.substring(8, 14)
  let result

  if (serverTime) {
    serverTime = serverTime.substr(0, 8) + ' ' + serverTime.substr(8)
  }

  let duration = moment.duration(moment(serverTime).diff(`${date} ${time}`))
  let hours = duration.asHours()

  if (format === 'DHM') {
    if (hours > 24) {
      result = `${Math.floor(
        duration.asDays()
      )}d ${duration.hours()}h ${duration.minutes()}m`
    } else if (hours > 1) {
      result = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`
    } else {
      result = `${Math.floor(duration.asMinutes())}m`
    }
  } else {
    if (hours > 1) {
      result = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`
    } else {
      result = `${Math.floor(duration.asMinutes())}m`
    }
  }

  return result
}

export function isExceedTimePolicy(
  assignDate,
  modality,
  timeGuarantee,
  serverTime = undefined
) {
  if (!assignDate || assignDate.length !== 14) return

  const date = assignDate.substring(0, 8)
  const time = assignDate.substring(8, 14)

  if (serverTime) {
    serverTime = serverTime.substr(0, 8) + ' ' + serverTime.substr(8)
  }

  let duration = moment.duration(moment(serverTime).diff(`${date} ${time}`))
  let diffNow = Math.floor(duration.asMinutes())

  const timePolicyHH = parseInt(timeGuarantee[modality]?.timePolicyHH || 99999)
  const timePolicyMM = parseInt(timeGuarantee[modality]?.timePolicyMM || 99999)

  const timePolicy = timePolicyHH * 60 + timePolicyMM

  return diffNow >= timePolicy
}

export function getDoctorName(doctor = [], code) {
  return (
    doctor
      .filter(d => d.radName === code || d.radCode === code)
      .map(d => ({
        signerName: d.radName || d.radCode,
        desc: d.radDesc,
        descEng: d.radDescEng,
        primaryKey: d.radPrimaryKey,
        userName: d.radUserName,
      })) || {}
  )
}

export function isExceedTimeFinalize(
  data,
  timeGuarantee,
  serverTime = undefined
) {
  if (
    !data.referencedStudySequence ||
    data.referencedStudySequence.length !== 19
  )
    return

  if (serverTime) {
    serverTime = serverTime.substr(0, 8) + ' ' + serverTime.substr(8)
  }

  let timeIn = data.referencedStudySequence.split(' ')
  let [DD, MM, YYYY] = timeIn[0].split('/')
  let [HH, mm, ss] = timeIn[1].split(':')
  timeIn = `${YYYY}${MM}${DD} ${HH}${mm}${ss}`

  let duration = moment.duration(moment(serverTime).diff(`${timeIn}`))
  let diffNow = Math.floor(duration.asMinutes())

  const timePolicy =
    parseInt(timeGuarantee[data.modality].timeFinallizeHH) * 60 +
    parseInt(timeGuarantee[data.modality].timeFinallizeMM)

  return diffNow >= timePolicy
}

export function getTabNameFromUrl(pathname) {
  if (!pathname) return

  const split = pathname.split('/')
  return split[split.length - 1]
}

export function convertToTreeObj(data = []) {
  return data.map(d => ({
    id: d.FOLDER_ID.toString(),
    parent: d.PARENT_ID === 0 ? '#' : d.PARENT_ID.toString(),
    text: d.FOLDER_NAME,
  }))
}

export function combineTreeArr(privateArr = [], publicArr = []) {
  return privateArr.concat(publicArr)
}

export const browserDetect =
  navigator.userAgent.indexOf('Edg') !== -1
    ? 'edge'
    : navigator.userAgent.indexOf('Chrome') !== -1
    ? 'chrome'
    : 'other'

export const isEnglish = str => {
  if (!str) return

  // str = str.replace(/[^a-zA-Z0-9]/g, '')
  // console.log(str)
  return /^[A-Za-z0-9.!@#$%&*()-_ ,]*$/i.test(str)
}

export function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}

export function blockClickBack() {
  const script = document.createElement('script')
  script.src = '/js/script.js'
  script.defer = true
  document.body.appendChild(script)

  return script
}

export function getHost(systemProperties) {
  return systemProperties.appMode === 'production'
    ? ''
    : `${systemProperties.serverProperties.HOST}:${systemProperties.serverProperties.SERVER_PORT}`
}

export function clearLocalStorage() {
  Object.keys(STORAGE_NAME).forEach(key => {
    if (
      key !== 'mode' &&
      key !== 'fontSize' &&
      key !== 'columnModel' &&
      key !== 'showPublicTemplate'
    ) {
      window.localStorage.removeItem(STORAGE_NAME[key])
    }
  })
}

export function getRandomId() {
  return Math.random().toString(36).slice(2, 7)
}

export function hasPermission(name, history, user, section) {
  if (user && user[name] != null && user[name] !== '1') {
    if (section === 'setting') {
      return history.push(
        `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}`
      )
    }

    if (user.allowWorklist === '1') {
      return history.push(`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}`)
    } else {
      window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
    }
  }
}

export function capitalizeFirstLetter(string) {
  if (!string) return ''
  // return string.charAt(0).toUpperCase() + string.slice(1)
  return string[0].toUpperCase() + string.slice(1)
}

export function capitalizeSentence(string) {
  if (!string) return ''

  const words = string.trim().split(' ')

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1)
  }

  return words.join(' ')
}

export function checkLogin() {
  if (!window.localStorage.getItem(STORAGE_NAME.token)) {
    window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
  }
}

export function objNullToEmpty(obj = {}) {
  let newObj = {}
  Object.keys(obj).forEach(key => {
    // if (!obj[key]) {
    if (obj[key] == null || obj[key] == undefined) {
      newObj[key] = ''
    } else {
      newObj[key] = obj[key]

      if (typeof obj[key] == 'string') {
        newObj[key] = obj[key]?.trim()
      }

      if (key === 'name' || key === 'otherName') {
        newObj[key] = obj[key].replace('  ', ' ')
      }
    }
  })

  return newObj
}

export function objNullToZero(obj = {}) {
  let newObj = {}
  Object.keys(obj).forEach(key => {
    if (obj[key] == null || obj[key] == undefined) {
      newObj[key] = '0'
    } else {
      newObj[key] = obj[key]
    }

    // if (key === 'PM_ORDER_ARRIVAL' || key === 'PM_WORKLIST_ALL') {
    if (key === 'PM_WORKLIST_ALL') {
      newObj[key] = '1'
    }
  })

  return newObj
}

export function isMobileOrTablet() {
  return /Android|iPhone|iPad/i.test(navigator.userAgent)
}

export function invertColor(hex) {
  console.log(hex)
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  // invert color components
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b)
}

function padZero(str, len) {
  len = len || 2
  var zeros = new Array(len).join('0')
  return (zeros + str).slice(-len)
}

export function convertStatus(value) {
  const status = {
    N: 'New',
    D: 'Prelim',
    R: 'Verified',
  }
  if (value in status) return status[value]

  return 'Unknown'
}

export const calculateLmp = date => {
  if (!date) return { lmpGa: '', lmpEdc: '' }

  const dayInput = parseInt(moment(date).format('DD'))
  const monthInput = parseInt(moment(date).format('MM')) - 1
  const yearInput = parseInt(moment(date).format('YYYY'))

  const dayNow = parseInt(moment().format('DD'))
  const monthNow = parseInt(moment().format('MM')) - 1
  const yearNow = parseInt(moment().format('YYYY'))

  const a = moment([yearNow, monthNow, dayNow])
  const b = moment([yearInput, monthInput, dayInput])
  const dayDiff = parseInt(a.diff(b, 'days'))
  const week = Math.floor(dayDiff / 7)
  const day = dayDiff % 7
  let lmpGa = week + 'w'
  if (day > 0) lmpGa += day + 'd'

  const lmpEdc = b.add(280, 'day').format('YYYYMMDD')

  return { lmpGa, lmpEdc }
}

export const calculateEdc = date => {
  if (!date) return ''

  const dayInput = parseInt(moment(date).format('DD'))
  const monthInput = parseInt(moment(date).format('MM')) - 1
  const yearInput = parseInt(moment(date).format('YYYY'))

  const dayNow = parseInt(moment().format('DD'))
  const monthNow = parseInt(moment().format('MM')) - 1
  const yearNow = parseInt(moment().format('YYYY'))

  const a = moment([yearNow, monthNow, dayNow])
  const b = moment([yearInput, monthInput, dayInput])

  let c = b.subtract(280, 'day').format('DD/MM/YYYY')
  const csp = c.split('/')
  c = moment([parseInt(csp[2]), parseInt(csp[1]) - 1, parseInt(csp[0])])

  const dayDiff = parseInt(a.diff(c, 'days'))
  const week = Math.floor(dayDiff / 7)
  const day = dayDiff % 7
  let edcGa = week + 'w'
  if (day > 0) edcGa += day + 'd'

  return edcGa
}

export function statusToName(status) {
  let name = 'Unknown'

  switch (status) {
    case 'N':
    case 'P':
      name = 'New'
      break
    case 'D':
      name = 'Prelim'
      break
    case 'R':
    case 'A':
      name = 'Verified'
      break

    default:
      break
  }

  return name
}

export function makePermissionGroup(p) {
  return [
    {
      label: 'Patient Management',
      name: 'PM_PATIENT',
      allow: p.PM_PATIENT,
      main: true,
      sub: [
        {
          label: 'Registration',
          name: 'PM_REGISTRATION',
          allow: p.PM_REGISTRATION,
        },
      ],
    },
    {
      label: 'Report Management',
      name: 'PM_REPORT',
      allow: p.PM_REPORT,
      main: true,
      sub: [
        {
          label: 'Worklist',
          name: 'PM_RADIOLOGIST_WORKLIST',
          allow: p.PM_RADIOLOGIST_WORKLIST,
          sub: [
            {
              label: 'New',
              name: 'PM_WORKLIST_ALL',
              allow: p.PM_WORKLIST_ALL,
              required: true,
            },
            {
              label: 'Prelim',
              name: 'PM_WORKLIST_UNVERIFIED',
              allow: p.PM_WORKLIST_UNVERIFIED,
            },
            {
              label: 'Verified',
              name: 'PM_WORKLIST_REPORTED',
              allow: p.PM_WORKLIST_REPORTED,
            },
          ],
        },
        {
          label: 'Report Template',
          name: 'PM_REPORT_TEMPLATE',
          allow: p.PM_REPORT_TEMPLATE,
        },
        {
          label: 'Teaching Files',
          name: 'PM_TEACHING_FILES',
          allow: p.PM_TEACHING_FILES,
        },
        {
          label: 'Report Search',
          name: 'PM_REPORT_SEARCH',
          allow: p.PM_REPORT_SEARCH,
        },
      ],
    },
    {
      label: 'Setting',
      name: 'PM_SYSTEM_CONFIG',
      allow: p.PM_SYSTEM_CONFIG,
      main: true,
      sub: [
        {
          label: 'User',
          name: 'PM_USER',
          allow: p.PM_USER,
        },
        {
          label: 'Group & Permission',
          name: 'PM_USER_GROUP',
          allow: p.PM_USER_GROUP,
        },
        {
          label: 'Order',
          name: 'PM_ORDER',
          allow: p.PM_ORDER,
        },
        {
          label: 'Default Date ',
          name: 'PM_TIME_GUARANTEE',
          allow: p.PM_TIME_GUARANTEE,
        },

        {
          label: 'System Properties',
          name: 'PM_SYSTEM_PROPERTIES',
          allow: p.PM_SYSTEM_PROPERTIES,
        },
      ],
    },
  ]
}

export function reFormatNumber(value, digit = 2) {
  if (!value) return 0

  const n = parseFloat(value).toFixed(digit)
  return Number(n).toLocaleString('en')
}

export function onlyHasValueArray(elm) {
  return elm != null && elm !== false && elm !== ''
}
