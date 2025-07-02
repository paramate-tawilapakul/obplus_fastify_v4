const db = require('../db/setup')
const { isObject, isEmpty } = require('lodash')
const { dateToDBformat, handleErrorLog } = require('./utils')
const dayjs = require('dayjs')

const fileModule = 'utils > db-utils >'

exports.paginationQueryBuilder = options => {
  return `WITH SQLPaging AS (
            SELECT TOP(${
              options.rowsPerPage * options.pageNum
            }) ResultNum = ROW_NUMBER() OVER (${options.orderBy}) , ${
    options.columns ? options.columns.join(',') : '*'
  }  
            FROM  ${options.table} 
            ${
              options.join?.length > 0
                ? options.join
                    .map(j => {
                      return ` ${j.type} ${j.table} ON ${j.table}.${j.column} = ${options.table}.${options.joinKey}`
                    })
                    .join(' ')
                : ''
            }
            ${options.where}
        ) SELECT * FROM SQLPaging WHERE ResultNum > ${
          (options.pageNum - 1) * options.rowsPerPage
        }`
}

function stripQuote(obj = {}) {
  let newObj = {}
  Object.keys(obj).forEach(key => {
    newObj[key] = obj[key].replace(/'/g, '')
    newObj[key] = newObj[key].replace(/;/g, '')
  })

  return newObj
}

function getTagsQuery(tagId) {
  if (tagId) {
    return ` AND TR_TAG_ID in (${tagId.split(',').map(t => "'" + t + "'")}) `
  }

  return ' '
}

exports.whereFilters = (filters, tab = 'new', defaultDate, dateNow) => {
  // console.log(tab)
  let where = ''

  let whereDate = ''

  filters = stripQuote(filters)

  if (filters.name) {
    where += ` AND PACS_STUDY.PATIENT_NAME LIKE '%${filters.name}%' `
  }

  if (filters.hn) {
    if (tab === 'teachingFiles') {
      where += ` AND ( PACS_STUDY.PATIENT_ID = '${filters.hn}' or NOTE LIKE '%${filters.hn}%' ) `
    } else {
      where += ` AND PACS_STUDY.PATIENT_ID = '${filters.hn}' `
    }
  }

  if (filters.desc) {
    where += ` AND PACS_STUDY.STUDY_DESCRIPTION LIKE '%${filters.desc}%' `
    // where += ` AND RIS_DATA.SCHEDULED_PROC_DESC LIKE '%${filters.desc}%' `
  }

  if (filters.tagId) {
    where += getTagsQuery(filters.tagId)
  }

  if (tab === 'verified') {
    // console.log('tab verified')
  }

  if (tab === 'favorite') {
    // console.log('tab favorite')
  }

  if (tab === 'teachingFiles') {
    // console.log('no date')
  } else {
    whereDate = ` AND PACS_STUDY.OPERATORS_NAME >= '${getDateStart(
      defaultDate
    )}' AND PACS_STUDY.OPERATORS_NAME <= '${dateNow}' `

    if ((filters.hn || filters.name || filters.desc) && !filters.dateFrom) {
      // console.log('++++++ search but no date filter')
      whereDate = ` AND PACS_STUDY.OPERATORS_NAME >= '${getDateStart(
        process.env.SEARCH_DEFAULT_DATE
      )}' AND PACS_STUDY.OPERATORS_NAME <= '${dateNow}' `
    }
  }

  if (filters.dateFrom && filters.dateTo) {
    // console.log('++++++ search with date filter')
    whereDate = ` AND PACS_STUDY.STUDY_DATE >= '${dateToDBformat(
      filters.dateFrom
    )}' AND PACS_STUDY.STUDY_DATE <= '${dateToDBformat(filters.dateTo)}' `
  }

  where += whereDate

  return where
}

function getDateStart(defaultDate) {
  if (!defaultDate) defaultDate = process.env.DEFAULT_DATE

  return dayjs().subtract(defaultDate, 'days').format('YYYYMMDD') + '000000'
}

function getDateBetween(defaultDate = '30', withTime = true) {
  let dDate = parseInt(defaultDate) || 0
  let timeStart = withTime ? '000000' : ''
  let timeEnd = withTime ? '235959' : ''
  const dateFrom =
    dayjs()
      .subtract(dDate > 0 ? dDate - 1 : dDate, 'days')
      .format('YYYYMMDD') + timeStart

  // fix time between server not match exactly
  const dateNow = dayjs().format('YYYYMMDD') + timeEnd

  return [dateFrom, dateNow]
}

exports.getDateBetween = getDateBetween

exports.updateDB = async (table, updateColumns, where) => {
  try {
    if (!isValidParameter(table, updateColumns, where)) return

    const returnId = Object.keys(where)[0]
    // console.log('table', table)
    // console.log('updateColumns', JSON.stringify(updateColumns, null, 2))
    // console.log('where', JSON.stringify(where, null, 2))
    // console.log('returnId', returnId)

    const data = await db(table)
      .where(where)
      .update(updateColumns, [returnId], { includeTriggerModifications: true })

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} updateDB(): ${error}`)
    return false
  }
}

function isValidParameter(table, updateColumns, where) {
  let message = ''
  if (!table) {
    message = 'Invalid Table :' + table
    handleErrorLog(`${fileModule} isValidParameter(): ${message}`)
    console.error(message)
    return false
  }
  if (!isObject(updateColumns) || isEmpty(updateColumns)) {
    message = 'Invalid Columns :' + updateColumns
    message += 'Must be : { column1:value1, column2:value2,... }'
    handleErrorLog(`${fileModule} isValidParameter(): ${message}`)
    console.error(message)
    return false
  }
  if (!isObject(where) || isEmpty(where)) {
    message = 'Invalid Where Clause :' + where
    message += 'Must be : { whereColumn:value }'
    handleErrorLog(`${fileModule} isValidParameter(): ${message}`)
    console.error(message)
    return false
  }

  return true
}
