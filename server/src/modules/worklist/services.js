const sample = require('lodash').sample

const db = require('../../db/setup')
const db_dicom = require('../../db/setup-dicom')
const { Logger, logFormat } = require('../../logger')
const { whereFilters, paginationQueryBuilder } = require('../../utils/db-utils')
const dayjs = require('dayjs')
const { getSyspropsValue } = require('../../cache/cache')
const {
  getTags,
  createOrder,
  getTemplateData,
} = require('../patient-data/services')

const columns = [
  'PACS_STUDY.ACCESSION_NUMBER as id',
  'PACS_STUDY.PATIENT_ID as hn',
  'PACS_STUDY.PATIENT_NAME as name',
  'PACS_STUDY.ACCESSION_NUMBER as accession',
  'PACS_STUDY.STUDY_DESCRIPTION as description',
  'PACS_STUDY.STUDY_DATE as studyDate',
  'PACS_STUDY.STUDY_TIME as studyTime',
  'PACS_STUDY.INSTITUTION_NAME as location',
  'PACS_STUDY.STUDY_STATUS as status',
  'PACS_STUDY.REPORTED_DOCTOR as reportedDoctor',
  'PACS_STUDY.NAME_OF_PHYSICS_READING_STUDY as prelimDoctor',
  'PACS_STUDY.REQUEST_DOCTOR as reqDoctor',
  'PACS_STUDY.IMAGE_STATUS as imageStatus',
  'PACS_STUDY.STUDY_SOURCE_AE as sourceAe',
  // 'RIS_DATA.SCHEDULED_PROC_DESC as description',
]

const columns2 = [
  'OB_STUDY.OB_STUDY_TYPE as obStudyType',
  'OB_STUDY.OB_ACCESSION as obAccession',
  'OB_STUDY.OB_NO_FETUS as noFetus',
  'OB_STUDY.OB_EDC as edc',
  'OB_STUDY.OB_EDC_GA as edcGa',
  'OB_STUDY.OB_INDICATION_SELECT as indicationSelect',
  'OB_STUDY.OB_INDICATION as indication',
  'OB_STUDY.OB_LMP as lmp',
  'OB_STUDY.OB_LMP_GA as lmpGa',
  'OB_STUDY.OB_LMP_EDC as lmpEdc',
  'OB_STUDY.OB_US_GA as usGa',
  'OB_STUDY.OB_US_EDC as usEdc',
  'OB_STUDY.OB_US_MACHINE as usMachine',
  'OB_STUDY.OB_METHOD as method',
  'RIS_DATA.PATIENT_BIRTH_DTTM as birthDate',
  'RIS_DATA.TRIGGER_DTTM as triggerDttm',
]

exports.getWorklist = async req => {
  try {
    const { tab, rowsPerPage, pageNum, status, stype } = req.query

    // console.log('tab', tab)
    // console.log('rowsPerPage', rowsPerPage)
    // console.log('pageNum', pageNum)
    // console.log('status', status)
    // console.log('stype', stype)
    // console.log('filters', filters)

    let defaultDate = process.env.DEFAULT_DATE

    if (process.env.NODE_ENV === 'production') {
      defaultDate = await getSyspropsValue('defaultDate')
    }

    const dateNow = dayjs().format('YYYYMMDDHHmmss')
    let studyType =
      stype !== 'all' ? ` AND OB_STUDY.OB_STUDY_TYPE = '${stype}' ` : ''

    let queryLocation = ``
    if (process.env.FIX_LOCATION === 'YES') {
      queryLocation = `AND PACS_STUDY.INSTITUTION_NAME in ('OB-GYN','OB','GYN')`
    }

    let where = `
        WHERE PACS_STUDY.STUDY_STATUS = '${status}' ${queryLocation}
        ${studyType}
    `
    let table = 'PACS_STUDY'
    const join = [
      {
        type: 'LEFT JOIN',
        table: 'OB_STUDY',
        column: 'OB_ACCESSION',
      },
    ]
    const joinKey = 'ACCESSION_NUMBER'

    where += whereFilters(req.query, tab, defaultDate, dateNow)

    // console.log(where)

    const sql = paginationQueryBuilder({
      rowsPerPage,
      pageNum,
      table,
      join,
      joinKey,
      where,
      // orderBy: ` ORDER BY PACS_STUDY.OPERATORS_NAME DESC `,
      orderBy: ` ORDER BY PACS_STUDY.STUDY_DATE DESC, PACS_STUDY.STUDY_TIME DESC `,
      columns: [
        ...columns,
        'OB_STUDY.OB_STUDY_TYPE as obStudyType',
        'OB_STUDY.OB_US_MACHINE as usMachine',
      ],
    })

    // console.log(sql)

    const sqlCount = `
        SELECT COUNT(*) as total FROM ${table}
        ${
          join?.length > 0
            ? join
                .map(j => {
                  return ` ${j.type} ${j.table} ON ${j.table}.${j.column} = ${table}.${joinKey}`
                })
                .join(' ')
            : ''
        }
        ${where}
    `

    let [rows, total] = await Promise.all([db.raw(sql), db.raw(sqlCount)])

    if (status === 'N') {
      if (rows.find(row => row.description.indexOf('???') > -1)) {
        // console.log('found ???')
        rows = rows.map(async row => {
          if (row.description.indexOf('???') > -1) {
            let newDesc = await db_dicom.raw(
              `SELECT study_desc as SCHEDULED_PROC_DESC FROM study1 WHERE accession_number ='${row.accession}' `
            )

            let newWord = newDesc[0].SCHEDULED_PROC_DESC

            await Promise.all([
              db.raw(
                `UPDATE PACS_STUDY SET STUDY_DESCRIPTION = '${newWord}' WHERE ACCESSION_NUMBER = '${row.accession}'`
              ),
              db.raw(
                `UPDATE RIS_DATA SET SCHEDULED_PROC_DESC = '${newWord}' WHERE ACCESSION_NO = '${row.accession}'`
              ),
            ])

            return { ...row, description: newWord }

            /*
             let newDesc = await db.raw(
               `SELECT SCHEDULED_PROC_DESC FROM RIS_DATA WHERE ACCESSION_NO ='${row.accession}' `
             )
            if (
              newDesc[0]?.SCHEDULED_PROC_DESC ===
              '??????????????? Ultrasound_OB'
            ) {
              let newWord = 'การตรวจติดตามผล Ultrasound_OB'
              await db.raw(
                `UPDATE PACS_STUDY SET STUDY_DESCRIPTION = '${newWord}' WHERE ACCESSION_NUMBER = '${row.accession}'`
              )
              await db.raw(
                `UPDATE RIS_DATA SET SCHEDULED_PROC_DESC = '${newWord}' WHERE ACCESSION_NO = '${row.accession}'`
              )

              return { ...row, description: newWord }
            } else if (newDesc[0]?.SCHEDULED_PROC_DESC.indexOf('???') === -1) {

              await db.raw(
                `UPDATE PACS_STUDY SET STUDY_DESCRIPTION = '${newDesc[0].SCHEDULED_PROC_DESC}' WHERE ACCESSION_NUMBER = '${row.accession}'`
              )

              return { ...row, description: newDesc[0].SCHEDULED_PROC_DESC }
            }
              */
          }

          return row
        })
      }
    }

    return [rows, total[0]['total']]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getPatientOb = async req => {
  try {
    const data = await db('PACS_STUDY')
      .select([...columns, ...columns2])
      .leftJoin(
        'OB_STUDY',
        'OB_STUDY.OB_ACCESSION',
        'PACS_STUDY.ACCESSION_NUMBER'
      )
      .leftJoin(
        'RIS_DATA',
        'RIS_DATA.ACCESSION_NO',
        'PACS_STUDY.ACCESSION_NUMBER'
      )
      .where('ACCESSION_NUMBER', req.query.accession)

    let reportTemplateId = {}

    if (
      req.query.reportPage === '1' &&
      process.env.SHOW_TAB_DATA_CHECKED === 'YES'
    ) {
      reportTemplateId = await getTemplateData(req.query.accession)
    }

    return { ...data[0], ...reportTemplateId }
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getConsultant = async req => {
  try {
    const data = await db('OB_STUDY_CONSULT')
      .select('CONSULT_ID as sysId', 'RAD_NAME as radName')
      .where('ACCESSION_NO', req.query.accession)

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

async function createObStudy(req) {
  try {
    const obj = req.body

    await db('OB_STUDY').insert(
      {
        OB_ACCESSION: obj.accession,
        OB_STUDY_TYPE: obj.obStudyType,
        OB_METHOD: obj.method,
        OB_INDICATION: obj.indication,
        OB_NO_FETUS: obj.noFetus,
        OB_LMP_GA: obj.lmpGa,
        OB_LMP_EDC: obj.lmpEdc,
        // OB_US_GA: obj.usGa,
        // OB_US_EDC: obj.usEdc,
        OB_LMP: obj.lmp,
        OB_US_MACHINE: obj.usMachine,
        OB_EDC: obj.edc,
        OB_EDC_GA: obj.edcGa,
        OB_INDICATION_SELECT: obj.indicationSelect,
      }
      // ['TAG_SYS_ID', 'TAG_NAME'],
      // { includeTriggerModifications: true }
    )

    await updateConsultant(req)
    if (obj.name !== obj.oldName) {
      updatePatientName(req)
    }

    // await updateIndictions(req)

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.createObStudy = createObStudy

exports.updateObStudy = async req => {
  try {
    const obj = req.body

    const checkIfExist = await db('OB_STUDY')
      .select()
      .where('OB_ACCESSION', '=', obj.accession)

    if (checkIfExist.length === 0) {
      return createObStudy(req)
    }

    await db('OB_STUDY')
      .update({
        OB_STUDY_TYPE: obj.obStudyType,
        OB_METHOD: obj.method,
        OB_INDICATION: obj.indication,
        OB_NO_FETUS: obj.noFetus,
        OB_LMP_GA: obj.lmpGa,
        OB_LMP_EDC: obj.lmpEdc,
        // OB_US_GA: obj.usGa,
        // OB_US_EDC: obj.usEdc,
        OB_LMP: obj.lmp,
        OB_US_MACHINE: obj.usMachine,
        OB_EDC: obj.edc,
        OB_EDC_GA: obj.edcGa,
        OB_INDICATION_SELECT: obj.indicationSelect,
      })
      .where('OB_ACCESSION', '=', obj.accession)

    await updateConsultant(req)
    if (obj.name !== obj.oldName) {
      updatePatientName(req)
    }

    // await updateIndictions(req)

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

// async function updateIndictions(req) {
//   try {
//     const obj = req.body

//     let indFromInput = obj.indicationSelect.split(', ')
//     indFromInput = indFromInput.map(ind => {
//       // return ind.toLowerCase()
//       return ind
//     })
//     // console.log('indFromInput', indFromInput)

//     let masterIndication = await db('OB_INDICATIONS')
//       .select()
//       .where('TYPE', '=', obj.obStudyType)

//     masterIndication = masterIndication.map(ind => {
//       // return ind.NAME.toLowerCase()
//       return ind.NAME
//     })
//     // console.log('masterIndication', masterIndication)

//     let length = indFromInput.length
//     for (let i = 0; i < length; i++) {
//       if (!masterIndication.includes(indFromInput[i])) {
//         // console.log('New indication:', capitalizeFirstLetter(indFromInput[i]))
//         await db('OB_INDICATIONS').insert({
//           // NAME: capitalizeFirstLetter(indFromInput[i]),
//           NAME: indFromInput[i],
//           TYPE: obj.obStudyType,
//         })
//       }
//     }

//     return true
//   } catch (error) {
//     console.error(error)
//     Logger('error').error(logFormat(null, error))
//   }
// }

async function updateConsultant(req) {
  try {
    const obj = req.body
    const userCode = req.user.code
    const timestamp = dayjs().format('YYYYMMDDHHmmss')

    await db('OB_STUDY_CONSULT').del().where('ACCESSION_NO', '=', obj.accession)

    let length = obj.consultant.length
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        await db('OB_STUDY_CONSULT').insert({
          ACCESSION_NO: obj.accession,
          RAD_NAME: obj.consultant[i],
          CREATE_BY: userCode,
          CREATE_DTTM: timestamp,
        })
      }
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

// exports.updateConsultant = updateConsultant

async function updatePatientName(req) {
  // console.log('updatePatientName()')
  try {
    const { hn, name } = req.body

    await Promise.all([
      db('RIS_DATA')
        .update({
          PATIENT_NAME: name,
        })
        .where('PATIENT_ID', '=', hn),
      db('PACS_STUDY')
        .update({
          PATIENT_NAME: name,
        })
        .where('PATIENT_ID', '=', hn),
      db('RIS_PATIENT_REGISTRATION')
        .update({
          PATIENT_NAME: name,
        })
        .where('PATIENT_HN', '=', hn),
    ])

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getTeachingWorklist = async req => {
  try {
    const { tab, rowsPerPage, pageNum, folderId } = req.query

    // console.log('tab', tab)
    // console.log('rowsPerPage', rowsPerPage)
    // console.log('pageNum', pageNum)
    // console.log('status', status)
    // console.log('stype', stype)
    // console.log('filters', filters)
    const sort = 'DESC'
    const table = req.query.tagId
      ? 'PACS_STUDY,RIS_TEACHING_FILES,RIS_TAG_RELATION'
      : 'PACS_STUDY,RIS_TEACHING_FILES'

    let where = `
          WHERE PACS_STUDY.ACCESSION_NUMBER = RIS_TEACHING_FILES.FILE_ORDER_ID  
          AND RIS_TEACHING_FILES.FOLDER_ID = ${folderId}
      `

    // const dateNow = dayjs().format('YYYYMMDDHHmmss')

    where += whereFilters(req.query, tab, null, null)

    const sql = paginationQueryBuilder({
      rowsPerPage,
      pageNum,
      table,
      where,
      orderBy: `ORDER BY STUDY_DATE ${sort}, STUDY_TIME ${sort}`,
    })
    // console.log(sql)

    let sqlCount = req.query.tagId
      ? ` SELECT COUNT(DISTINCT ACCESSION_NUMBER)  as total from PACS_STUDY,RIS_TEACHING_FILES,RIS_TAG_RELATION `
      : ` SELECT COUNT(*) as total FROM PACS_STUDY,RIS_TEACHING_FILES `

    sqlCount += where

    let [rows, total] = await Promise.all([db.raw(sql), db.raw(sqlCount)])

    const combinedWithTags = await getPatientTags(rows)

    return [combinedWithTags, total[0]['total']]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

async function getPatientTags(rows) {
  let newRows = []
  let length = rows?.length || 0

  for (let i = 0; i < length; i++) {
    const res = await getTags(rows[i].ACCESSION_NUMBER)
    newRows.push({
      ...rows[i],
      TAGS: res,
    })
  }

  return newRows
}

exports.autoGenerateOrder = async (userCode, t) => {
  try {
    let total = parseInt(t)
    let dataArr = []
    // const hnArr = await db.raw(
    //   `SELECT TOP ${total}
    //   PATIENT_HN hn,
    //   PATIENT_NAME name,
    //   PATIENT_ENAME nameEn,
    //   PATIENT_SEX gender,
    //   PATIENT_BIRTH_DTTM dob
    //   FROM RIS_PATIENT_REGISTRATION
    //   WHERE PATIENT_BIRTH_DTTM <> '0'
    //   AND PATIENT_BIRTH_DTTM <> ''
    //   AND PATIENT_BIRTH_DTTM is not null
    //   AND PATIENT_SEX <> ''
    //   AND PATIENT_SEX <> 'M'
    //   AND PATIENT_SEX <> 'O'
    //   AND PATIENT_NAME not like '%.%'
    //   AND PATIENT_NAME not like '%mrs%'
    //   AND PATIENT_NAME not like '%miss%'
    //   AND PATIENT_NAME not like '%mr%'
    //   AND PATIENT_HN like '%-%'
    //   AND PATIENT_ENAME <> ''
    //   ORDER BY NEWID()`
    // )

    // PROTOCOL_DESCRIPTION <> '' and
    //   PROTOCOL_DESCRIPTION NOT LIKE '%[?]%' and
    //   PROTOCOL_DESCRIPTION NOT LIKE '%Chest%' and
    //   PROTOCOL_DESCRIPTION NOT LIKE '%abdomen(%' and
    //   PROTOCOL_DESCRIPTION NOT LIKE '%[...]%' and
    //   PROTOCOL_MODALITY IN ('US','MG') AND
    //   PROTOCOL_TNAME <> ''

    // const locationArr = await db.raw(
    //   `SELECT LOCATION_CODE locationCode FROM RIS_LOCATION WHERE
    //   LOCATION_CODE <> '*' AND
    //   (LOCATION_CODE = 'US' OR LOCATION_CODE LIKE 'ANC%' OR LOCATION_CODE LIKE 'HR%' OR LOCATION_CODE = 'OB')`
    // )

    // const locationArr = await db.raw(
    //   `SELECT LOCATION_CODE locationCode FROM RIS_LOCATION WHERE
    //   LOCATION_CODE = 'OB-GYN'`
    // )
    // const protocolArr = await db.raw(
    //   `SELECT PROTOCOL_CODE code,PROTOCOL_NAME name,PROTOCOL_DESCRIPTION as [desc],PROTOCOL_MODALITY modality FROM RIS_PROTOCOL
    //   WHERE PROTOCOL_CODE LIKE '%RJH%'
    //    `
    // )

    const [hnArr, locationArr, protocolArr] = await Promise.all([
      db.raw(
        `SELECT TOP ${total} 
        PATIENT_HN hn,
        PATIENT_NAME name,
        PATIENT_ENAME nameEn,
        PATIENT_SEX gender,
        PATIENT_BIRTH_DTTM dob
        FROM RIS_PATIENT_REGISTRATION 
        WHERE PATIENT_BIRTH_DTTM <> '0' 
        AND PATIENT_BIRTH_DTTM <> '' 
        AND PATIENT_BIRTH_DTTM is not null
        AND PATIENT_SEX <> '' 
        AND PATIENT_SEX <> 'M' 
        AND PATIENT_SEX <> 'O'
        AND PATIENT_NAME not like '%.%' 
        AND PATIENT_NAME not like '%mrs%' 
        AND PATIENT_NAME not like '%miss%' 
        AND PATIENT_NAME not like '%mr%' 
        AND PATIENT_HN like '%-%' 
        AND PATIENT_ENAME <> ''
        ORDER BY NEWID()`
      ),
      db.raw(
        `SELECT LOCATION_CODE locationCode FROM RIS_LOCATION WHERE 
      LOCATION_CODE = 'OB-GYN'`
      ),
      db.raw(
        `SELECT PROTOCOL_CODE code,PROTOCOL_NAME name,PROTOCOL_DESCRIPTION as [desc],PROTOCOL_MODALITY modality FROM RIS_PROTOCOL 
      WHERE PROTOCOL_CODE LIKE '%RJH%' 
       `
      ),
    ])
    // console.log(locationArr)
    // console.log(protocolArr)
    let length = hnArr.length
    let patient, accession, locationCode, protocol
    for (let i = 0; i < length; i++) {
      patient = hnArr[i]
      accession =
        Math.floor(1000000 + Math.random() * 9000000) + '' + i.toString() // random number string 7 digit
      locationCode = sample(locationArr).locationCode
      protocol = [sample(protocolArr)]
      // console.log(locationCode)
      // console.log(protocol)

      const req = {
        user: { code: userCode },
        body: {
          patient,
          locationCode,
          protocol,
          accession,
        },
      }

      dataArr.push(req)

      // await createOrder(req)
    } // end of for

    let count = 0
    let intervalId = setInterval(async () => {
      console.log(`Create order ${count + 1}`)
      await createOrder(dataArr[count])
      ++count

      if (count === total) {
        clearInterval(intervalId)
        console.log('All done...')
      }
    }, 1600)

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}
