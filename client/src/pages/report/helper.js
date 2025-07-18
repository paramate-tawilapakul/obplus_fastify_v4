import axios from 'axios'
import {
  API,
  REPORT_ID,
  STORAGE_NAME,
  TAB_SPACE,
  reqHeader,
} from '../../config'
import {
  cleanUpContent,
  reFormatSpace,
  removeImageFromContent,
  replacePwithBR,
} from './report-utils'

export const randomMs = () => {
  return parseFloat((Math.random() * 100).toFixed(5))
}

export async function getReportId(accession, currentFetus, templateId) {
  try {
    const res = await axios.get(API.REPORT_ID, {
      params: {
        accession,
        currentFetus,
        templateId,
      },
    })

    return res.data.data.reportId
  } catch (error) {
    console.log(error)
  }
}

export async function autoSave(data, diagReport) {
  if (window.localStorage.getItem(STORAGE_NAME.isDataChange) === '1') {
    let res
    if (
      diagReport
      // &&
      // diagReport.content !== '<p>&nbsp;</p>' &&
      // window.localStorage.getItem(STORAGE_NAME.diagReport)
    ) {
      if (diagReport.content === '<p>&nbsp;</p>') diagReport.content = ''

      res = await axios.post(API.DIAG_REPORT, {
        accession: diagReport.accession,
        content: diagReport.content,
      })
      updateDataChange('0')
      return res.data.data
    }

    if (data) {
      res = await axios.post(API.REPORT_CONTENT, {
        reportData: cleanUpForm(data),
      })
      // console.log('save 1')
      updateDataChange('0')
      return res.data.data
    }
  }
}

export async function autoSave2(data) {
  if (window.localStorage.getItem(STORAGE_NAME.isProcedureDataChange) === '1') {
    let res

    if (data) {
      // console.log(data)
      res = await axios.post(API.REPORT_CONTENT, {
        reportData: cleanUpForm(data),
      })
      // console.log('save 2')
      updateProcedureDataChange('0')
      return res.data.data
    }
  }
}

export async function autoSave3(data) {
  if (window.localStorage.getItem(STORAGE_NAME.isCvlDataChange) === '1') {
    let res

    if (data) {
      let cvl = window.localStorage.getItem(STORAGE_NAME.cvl)
      let form = { ...cleanUpForm(data), 633: { type: 'T', value: cvl } }

      if (!cvl) delete form['633']

      // console.log('form', form)
      res = await axios.post(API.REPORT_CONTENT, {
        reportData: form,
      })

      updateCvlDataChange('0')
      return res.data.data
    }
  }
}

export function cleanUpForm(dataFormSend) {
  let cleanUpForm = {}

  if (!dataFormSend) return cleanUpForm

  Object.keys(dataFormSend).forEach(key => {
    if (key !== 'reportId') {
      if (Array.isArray(dataFormSend[key])) {
        cleanUpForm[key] = dataFormSend[key]
      } else {
        if (dataFormSend[key].type === 'S' && dataFormSend[key].value) {
          cleanUpForm[key] = dataFormSend[key]
        } else if (['T', 'A', 'C'].includes(dataFormSend[key].type)) {
          // console.log(dataFormSend[key]?.value, typeof dataFormSend[key]?.value)
          if (
            typeof dataFormSend[key]?.value === 'string' &&
            dataFormSend[key].value.trim() !== ''
          ) {
            cleanUpForm[key] = dataFormSend[key]
            cleanUpForm[key].value = cleanUpForm[key]?.value?.trim() || ''
          }
        }
      }
    }
  })

  cleanUpForm['reportId'] = dataFormSend['reportId']
  // console.log(cleanUpForm)

  return cleanUpForm
}

export function replaceNewLineWithBr(value) {
  return value?.replace(/(?:\r\n|\r|\n)/g, '<br>') || value
}

export const checkNumber = input => {
  if (!input) return

  let check = input.trim()
  let str = check.split('')

  if (str[0] === '.' || str[str.length - 1] === '.') {
    return false
  }

  let regexPattern = /^[0-9]*\.?[0-9]*$/
  // check if the passed number is integer or float
  if (!regexPattern.test(check)) return false

  return true
}

export const numFormatDigit = (num, digit = 2) => {
  if (!num) return

  return parseFloat(parseFloat(num).toFixed(digit))
}

export function newGa(name, valueInput, masterGa, callback, setAlert) {
  const ms = numFormatDigit(valueInput)
  const lastArr = numFormatDigit(masterGa[masterGa.length - 1].val)
  const firstArr = numFormatDigit(masterGa[0].val)
  let BreakException = {}
  let autoGA = ''
  let value, weeks, nextValue, nextWeeks, days, nextDays
  let difM = 0
  let perDay = 0
  let difM2 = 0
  let f
  //console.log(ms, firstArr, lastArr)
  if (ms >= firstArr && ms <= lastArr) {
    try {
      masterGa.forEach((obj, i) => {
        if (name === 'mGS') {
          days = obj.days
          nextDays = masterGa[i + 1].days
        }
        weeks = obj.weeks
        nextWeeks = masterGa[i + 1].weeks
        value = numFormatDigit(obj.val)
        nextValue = numFormatDigit(masterGa[i + 1].val)

        if (ms > value && ms < nextValue) {
          if (name === 'mGS') {
            f = numFormatDigit(valueInput, 1)
            if (f === value) {
              autoGA = weeks + 'w'
              if (days !== 0) {
                autoGA = autoGA + days + 'd'
              }
            } else {
              autoGA = nextWeeks + 'w'
              if (nextDays !== 0) {
                autoGA = autoGA + nextDays + 'd'
              }
            }
          } else {
            difM = nextValue - value
            perDay = numFormatDigit(difM / 7)
            difM2 = ms - value
            f = difM2 / perDay
            if (numFormatDigit(f % 1) >= 0.5) {
              f = Math.floor(f) + 1
            } else {
              f = Math.floor(f)
            }

            if (f === 0) {
              autoGA = weeks + 'w'
            } else if (f === 7) {
              autoGA = weeks + 1 + 'w'
            } else {
              autoGA = weeks + 'w' + f + 'd'
            }
          }

          callback(autoGA.replace('undefinedd', '').replace('undefinedw', ''))
          throw BreakException
        } else {
          if (ms === value) {
            autoGA = weeks + 'w'
            if (name === 'mGS') {
              if (days !== 0) {
                autoGA = autoGA + days + 'd'
              }
            }

            callback(autoGA.replace('undefinedd', '').replace('undefinedw', ''))
            throw BreakException
          }
        }
      })
    } catch (e) {
      if (e !== BreakException) throw e
    }
  } else {
    // if not match
    setAlert(prev => ({
      ...prev,
      show: true,
      message: 'Value not in range',
      severity: 'warning',
    }))
  }
}

export function updateDataChange(val) {
  window.localStorage.setItem(STORAGE_NAME.isDataChange, val)
}

export function updateCvlDataChange(val) {
  window.localStorage.setItem(STORAGE_NAME.isCvlDataChange, val)
}

export function updateProcedureDataChange(val) {
  window.localStorage.setItem(STORAGE_NAME.isProcedureDataChange, val)
}

export function appendTemplate(editor, template, reportFrom = 'OB') {
  // console.log(template)
  // console.log('reportFrom', reportFrom)
  const el = editor.current
  let appendTemplate = reFormatSpace(
    replacePwithBR(cleanUpContent(template, reportFrom))
  )

  appendTemplate = appendTemplate.replace(
    /&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;/g,
    TAB_SPACE['DEFAULT']
  )

  let originalContent = el.getContent()
  let newContent = originalContent + appendTemplate
  // console.log(`originalContent\n${originalContent}`)

  if (originalContent) {
    let first3charsOfTemplate = appendTemplate.substr(0, 3)
    let last4charsOfOriginal = originalContent.substr(
      originalContent.length - 4
    )

    // console.log('last4charsOfOriginal', last4charsOfOriginal)
    // console.log('first3charsOfTemplate', first3charsOfTemplate)

    if (last4charsOfOriginal === '</p>' && first3charsOfTemplate === '<p>') {
      newContent = `${originalContent.substr(
        0,
        originalContent.length - 4
      )}<br /><br />${appendTemplate.substr(3, appendTemplate.length)}`

      // console.log(`newContent\n${newContent}`)
    }
  }

  el.setContent(newContent)

  el.undoManager.add()
}

export async function sendToReportSearch(
  patient,
  content,
  user,
  systemProperties,
  timestamp,
  indication,
  signer
) {
  try {
    // SEND DATA TO REPORT SEARCH API
    // ORDER_TAG
    // console.log('patient', patient)
    // console.log('content', content)
    // console.log('user', user)
    // console.log('systemProperties', systemProperties)
    // console.log('severityOption', severityOption)
    // console.log('biradsOption', biradsOption)
    // console.log('timestamp', timestamp)

    // const responseTags = await axios.get(API.ORDER_TAG, {
    //   params: { accession: patient.accessionNumber },
    // })
    // let tags = ''
    // let tags = responseTags.data.data
    // tags =
    //   tags.length > 1
    //     ? tags.map(t => t.name).join(',')
    //     : tags.length === 1
    //     ? tags[0].name
    //     : ''

    const dataSaveToReportSearch = {
      hn: patient.hn,
      name: patient.name.replace(/\s+/g, ' '),
      accession: patient.accession,
      studyType: patient.obStudyType,
      indication,
      content: removeImageFromContent(content),
      signer,
      // tags,
      description: patient.description || '',
      reportedDate: timestamp,
      studyDate: patient.studyDate + patient.studyTime,
      isEdit: ['D', 'R'].includes(patient.status),
    }

    await axios.post(
      systemProperties.reportSearchServer + API.INSERT_REPORT_SEARCH,
      {
        bodyData: dataSaveToReportSearch,
        token: user.token || window.localStorage.getItem(STORAGE_NAME.token),
      },
      reqHeader
    )
  } catch (error) {
    console.log(error)
  }
}

export function getRiD(templateName, fetus) {
  return REPORT_ID[templateName][fetus]
  // REPORT_ID[templateName][fetus]?.REPORT_ID || REPORT_ID[templateName][fetus]
}
