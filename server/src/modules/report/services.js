const fs = require('graceful-fs')
const { promisify } = require('node:util')
const dayjs = require('dayjs')

const db = require('../../db/setup')
const { getConsultant, getPatientOb } = require('../worklist/services')
const { getImages } = require('../dicom-images/services')
const { createPdf } = require('../pdf/services')
const { addLogs, MODULE } = require('../logs/services')
const { genImageArr, handleErrorLog } = require('../../utils/utils')
const {
  getMasterValueFromCache,
  getMasterOptionFromCache,
} = require('../../cache/cache')

const exists = promisify(fs.exists)

const fileModule = 'report > services >'

const gynTemplateId = [31, 32, 33, 40, 34, 35, 36, 37, 38]
const obTemplateId = [
  1, 2, 4, 5, 6, 39, 7, 8, 9, 3, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 41, 42, 43, 44, 45, 46,
]

const EFW_CHARTS = {
  HL: 29,
  SP: 30,
  HL3: 31,
}

async function getReportData(req) {
  try {
    const { accession } = req.query
    let stype = ''
    let whereTemplate = gynTemplateId
    const newData = {
      patientInfo: null,
      reportTemplate: {
        1: {},
        2: {},
        3: {},
        4: {},
      },
      reportContent: '',
      consultant: [],
      reportTimestamp: '',
      imagesSelected: [],
      efwCharts: {},
    }
    let totalFetus = 1
    let reportTimestamp = ''

    let data = await db('OB_STUDY')
      .select()
      .leftJoin('RIS_DATA', 'RIS_DATA.ACCESSION_NO', 'OB_STUDY.OB_ACCESSION')
      .column([
        { stype: 'OB_STUDY_TYPE' },
        { method: 'OB_METHOD' },
        { indication: 'OB_INDICATION' },
        { noFetus: 'OB_NO_FETUS' },
        { lmpGa: 'OB_LMP_GA' },
        { lmpEdc: 'OB_LMP_EDC' },
        { usGa: 'OB_US_GA' },
        { usEdc: 'OB_US_EDC' },
        { lmp: 'OB_LMP' },
        { usMachine: 'OB_US_MACHINE' },
        { edc: 'OB_EDC' },
        { edcGa: 'OB_EDC_GA' },
        { indicationSelect: 'OB_INDICATION_SELECT' },
        { dob: 'PATIENT_BIRTH_DTTM' },
        { name: 'PATIENT_NAME' },
        { hn: 'PATIENT_ID' },
        // { triggerDttm: 'TRIGGER_DTTM' },
      ])
      .where('OB_ACCESSION', accession)

    if (data.length > 0) {
      newData.patientInfo = data[0]
      stype = data[0].stype

      // console.log('newData.patientInfo', newData.patientInfo)
      if (stype === '1') {
        totalFetus = parseInt(data[0].noFetus) || 1
        whereTemplate = obTemplateId
      }
      // console.log(stype)
      // console.log(whereTemplate)

      for (let fetus = 1; fetus <= totalFetus; fetus++) {
        data = await db('OB_REPORT')
          .select()
          .column([
            { reportId: 'REPORT_ID' },
            { templateId: 'REF_TEMPLATE_ID' },
            { reportTimestamp: 'REPORT_UPDATE_DATE' },
          ])
          .whereIn('REF_TEMPLATE_ID', whereTemplate)
          .andWhere('ACCESSION', accession)
          .andWhere('REPORT_FETUS_NO', fetus)
          .orderBy('REF_TEMPLATE_ID', 'asc')

        // if (studyType === '2') {
        //   data = data.filter(d => gynTemplateId.includes(d.templateId))
        // } else if (studyType === '1') {
        //   data = data.filter(d => obTemplateId.includes(d.templateId))
        // }

        let rows = data.length
        for (let row = 0; row < rows; row++) {
          if (data[row].reportId) {
            // add if check for fix Undefined binding(s) detected
            if (row === 0 && data[row].reportId) {
              reportTimestamp = data[row].reportTimestamp
            }

            // ERROR: Undefined binding(s) detected
            let report = await db('OB_REPORT_CONTENT')
              .select()
              .leftJoin(
                'OB_MASTER_VALUE',
                'OB_MASTER_VALUE.VALUE_ID',
                'OB_REPORT_CONTENT.REF_VALUE_ID'
              )
              .leftJoin(
                'OB_MASTER_OPTIONS',
                'OB_MASTER_OPTIONS.OP_ID',
                'OB_REPORT_CONTENT.CONTENT_OPTION'
              )
              .column([
                { valueId: 'OB_REPORT_CONTENT.REF_VALUE_ID' },
                { valueName: 'OB_MASTER_VALUE.VALUE_NAME' },
                { display: 'OB_MASTER_VALUE.VALUE_DISPLAY_CONTENT' },
                { type: 'OB_MASTER_VALUE.VALUE_TYPE' },
                { unit: 'OB_MASTER_VALUE.VALUE_UNIT' },
                { content: 'CONTENT' },
                { contentOption: 'CONTENT_OPTION' },
                {
                  contentOptionDisplay: 'OB_MASTER_OPTIONS.OP_DISPLAY_CONTENT',
                },
                { freeName: 'FREE_VALUE_NAME' },
                { freeUnit: 'FREE_VALUE_UNIT' },
                { optionFreetext: 'CONTENT_OPTION_FREETEXT' },
                { displayStyle: 'VALUE_DISPLAY_STYLE' },
                // { contentOptionCheckbox: 'CONTENT_OPTION_CHECKBOX' },
              ])
              .where('REF_REPORT_ID', data[row].reportId)
              .orderBy('OB_MASTER_VALUE.VALUE_ORDER', 'asc')
            // console.log('data[row].reportId', data[row].reportId)
            // console.log('data[row].templateId', data[row].templateId)
            // console.log('report', report)
            // console.log(data[row])
            newData.reportTemplate[fetus][data[row].templateId] = report
          }
        }
      }

      const [consultant, diagReport, extPatientInfo, imagesSelected] =
        await Promise.all([
          getConsultant(req),
          getDiagReport(req),
          getPatientOb(req),
          getImages(accession),
        ])

      newData.consultant = consultant
      newData.reportContent = diagReport[0]?.content || ''
      newData.reportTimestamp = reportTimestamp
      newData.patientInfo = { ...newData.patientInfo, ...extPatientInfo }
      newData.imagesSelected = genImageArr(imagesSelected, accession)

      for (let fetus = 1; fetus <= totalFetus; fetus++) {
        let efwPath = `${process.env.IMAGES_PATH}/efw/${accession}/${fetus}/efw.jpg`
        let isExist = await exists(efwPath)
        if (isExist) {
          newData.efwCharts[
            fetus
          ] = `/api/v1/files/efw?accession=${accession}&fetusNo=${fetus}&r=${Math.random()}`
        }
      }
    }

    // console.log('report:', newData)

    return newData
  } catch (error) {
    handleErrorLog(`${fileModule} getReportData(): ${error}`)
  }
}

exports.getReportData = getReportData

exports.getReportHistory = async req => {
  //   console.log('getReportHistory()')
  // PACS_STUDY accession,obStudyType,status
  try {
    const { hn, exceptAccession } = req.query
    const data = await db('PACS_STUDY')
      .select()
      .leftJoin(
        'OB_STUDY',
        'OB_STUDY.OB_ACCESSION',
        'PACS_STUDY.ACCESSION_NUMBER'
      )
      .column({
        accession: 'PACS_STUDY.ACCESSION_NUMBER',
        obStudyType: 'OB_STUDY.OB_STUDY_TYPE',
        orderDate: 'STUDY_DATE',
        orderTime: 'STUDY_TIME',
        description: 'STUDY_DESCRIPTION',
        status: 'STUDY_STATUS',
        prelimDoctor: 'NAME_OF_PHYSICS_READING_STUDY',
      })
      .whereIn('STUDY_STATUS', ['D', 'R'])
      .andWhere('PACS_STUDY.PATIENT_ID', hn)
      .andWhere('PACS_STUDY.ACCESSION_NUMBER', '<>', exceptAccession)
      .andWhere(builder => {
        if (process.env.SAMPLE_IMAGE === 'YES')
          builder.whereIn('INSTITUTION_NAME', ['OB-GYN', 'OB', 'GYN'])
      })
      .orderBy('OPERATORS_NAME', 'desc')

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getReportHistory(): ${error}`)
  }
}

exports.getAutoGaData = async req => {
  //   console.log('getAutoGaData()')
  try {
    const { name } = req.query
    const data = await db(`OB_Tbl${name}`).select().orderBy(`${name}id`, 'asc')

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getAutoGaData(): ${error}`)
  }
}

async function getReportId(req) {
  //   console.log('getReportId()')
  try {
    const { currentFetus, accession, templateId } = req.query
    const data = await db('OB_REPORT')
      .select()
      .column([{ reportId: 'REPORT_ID' }])
      .where('ACCESSION', accession)
      .andWhere('REF_TEMPLATE_ID', templateId)
      .andWhere('REPORT_FETUS_NO', currentFetus)

    if (data.length > 0) {
      return data[0]
    }

    const reportId = await createReportId(req)

    return { reportId }
  } catch (error) {
    handleErrorLog(`${fileModule} getReportId(): ${error}`)
  }
}

exports.getReportId = getReportId

async function getDiagReport(req) {
  //   console.log('getDiagReport()')
  try {
    const { accession } = req.query
    const data = await db('RIS_DIAGNOSTIC_REPORT')
      .select()
      .column([{ content: 'REPORT_MANUAL_CONTENT' }])
      .where('REF_ITEM_ID', accession)

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getDiagReport(): ${error}`)
  }
}

exports.getDiagReport = getDiagReport

exports.updateDiagReport = async req => {
  try {
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    let { accession, content } = req.body
    const user = req.user
    content = cleanUpContent(content)

    let data = await db('RIS_DIAGNOSTIC_REPORT').where(
      'REF_ITEM_ID',
      '=',
      accession
    )
    const columns = {
      REPORT_MANUAL_CONTENT: content,
      REPORT_SIGNER: user.radName || user.code,
      REPORT_UPDATE_DATE: timestamp,
    }
    if (data.length > 0) {
      /// udpate
      await db('RIS_DIAGNOSTIC_REPORT')
        .update(columns)
        .where('REF_ITEM_ID', '=', accession)
    } else {
      /// create
      await db('RIS_DIAGNOSTIC_REPORT').insert({
        ...columns,
        REF_ITEM_ID: accession,
      })
    }
    return true
  } catch (error) {
    handleErrorLog(`${fileModule} updateDiagReport(): ${error}`)
    return false
  }
}

async function createReportId(req) {
  try {
    // console.log('createReportId()')
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    const { currentFetus, accession, templateId } = req.query
    const data = await db('OB_REPORT')
      .insert({
        ACCESSION: accession,
        REF_TEMPLATE_ID: templateId,
        REPORT_FETUS_NO: currentFetus,
        REPORT_CREATE_DATE: timestamp,
        REPORT_UPDATE_DATE: timestamp,
      })
      .returning('REPORT_ID')

    // console.log('data', data)

    return data[0].REPORT_ID
  } catch (error) {
    handleErrorLog(`${fileModule} createReportId(): ${error}`)
  }
}

async function getAbnormalContent(req) {
  try {
    let { isDelete } = req.query
    isDelete = isDelete === 'true'
    // console.log('getAbnormalContent()', isDelete)

    const { reportId } = await getReportId(req)
    req['query'] = { ...req.query, reportId }

    if (isDelete) {
      // console.log('----------delete')
      await deleteReportContent(reportId)
    }

    const data = await getReportContent(req)

    return [data, reportId]
  } catch (error) {
    handleErrorLog(`${fileModule} getAbnormalContent(): ${error}`)
  }
}

exports.getAbnormalContent = getAbnormalContent

async function getReportContent(req) {
  try {
    const { reportId } = req.query
    let data = []
    // ERROR: Undefined binding(s) detected
    if (reportId) {
      data = await db('OB_REPORT_CONTENT')
        .select()
        .leftJoin(
          'OB_MASTER_VALUE',
          'OB_MASTER_VALUE.VALUE_ID',
          'OB_REPORT_CONTENT.REF_VALUE_ID'
        )
        .leftJoin(
          'OB_MASTER_OPTIONS',
          'OB_MASTER_OPTIONS.OP_ID',
          'OB_REPORT_CONTENT.CONTENT_OPTION'
        )
        .column([
          { reportId: 'REF_REPORT_ID' },
          { refValueId: 'OB_REPORT_CONTENT.REF_VALUE_ID' },
          { content: 'CONTENT' },
          { contentOption: 'CONTENT_OPTION' },
          { contentOptionDisplay: 'OB_MASTER_OPTIONS.OP_DISPLAY_CONTENT' },
          { contentValueName: 'OB_MASTER_VALUE.VALUE_NAME' },
          { contentUnit: 'OB_MASTER_VALUE.VALUE_UNIT' },
          { contentFreeValueName: 'FREE_VALUE_NAME' },
          { contentFreeValueUnit: 'FREE_VALUE_UNIT' },
          { contentOptionFreeText: 'CONTENT_OPTION_FREETEXT' },
          { contentOptionCheckBox: 'CONTENT_OPTION_CHECKBOX' },
        ])
        .where('REF_REPORT_ID', reportId)
        .orderBy('OB_MASTER_VALUE.VALUE_ORDER', 'asc')
    }

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getReportContent(): ${error}`)
  }
}

exports.getReportContent = getReportContent

function cleanUpContent(content) {
  if (typeof content !== 'string') return content

  return content.replace(/&lt;/g, '<')
}

exports.createReportContent = async req => {
  try {
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    let { reportData, isAllNormal, accession, currentFetus } = req.body
    // console.log('reportData', reportData)
    const reportId = reportData.reportId
    delete reportData.reportId
    // await deleteReportContent(reportId)
    if (isAllNormal) {
      // console.log('isAllNormal', isAllNormal)
      let reportIdArr = await db('OB_REPORT')
        .select()
        .column([{ reportId: 'REPORT_ID' }])
        .where('ACCESSION', accession)
        .andWhere('REPORT_FETUS_NO', currentFetus)
        .andWhere('REF_TEMPLATE_ID', '<>', 17) // not include Cord

      reportIdArr = reportIdArr.map(d => d.reportId)
      // console.log('reportIdArr', reportIdArr)
      await db('OB_REPORT_CONTENT').del().whereIn('REF_REPORT_ID', reportIdArr)
    }
    await db.transaction(async trx => {
      await trx('OB_REPORT_CONTENT').del().where('REF_REPORT_ID', '=', reportId)

      const valueIdData = Object.keys(reportData)
      let length = valueIdData.length
      for (let i = 0; i < length; i++) {
        // console.log('valueId', reportData[valueIdData[i]])
        if (Array.isArray(reportData[valueIdData[i]])) {
          // console.log('insert multiple')
          for (let j = 0; j < reportData[valueIdData[i]].length; j++) {
            let contentOption = reportData[valueIdData[i]][j].value
            // console.log(contentOption)
            await trx('OB_REPORT_CONTENT').insert({
              REF_REPORT_ID: reportId,
              REF_VALUE_ID: valueIdData[i],
              CONTENT: '',
              CONTENT_OPTION: contentOption,
              FREE_VALUE_NAME: '',
              FREE_VALUE_UNIT: '',
              CONTENT_CREATE_DATE: timestamp,
              CONTENT_UPDATE_DATE: timestamp,
              CONTENT_OPTION_FREETEXT: '',
              CONTENT_OPTION_CHECKBOX: '',
            })
          }
        } else {
          let content = cleanUpContent(reportData[valueIdData[i]].value)

          let freetext = cleanUpContent(
            reportData[valueIdData[i]]?.freetext || ''
          )
          let checkbox = reportData[valueIdData[i]]?.checkbox || ''
          let modifyContent = reportData[valueIdData[i]]?.content || ''

          let contentOption = reportData[valueIdData[i]].value
          let freeName = reportData[valueIdData[i]]?.freeName || ''
          let freeUnit = reportData[valueIdData[i]].freeUnit

          // S = select option
          if (reportData[valueIdData[i]].type === 'S') {
            content = ''
          } else {
            contentOption = 0
          }

          if ((freetext || checkbox) && modifyContent) {
            content = modifyContent
          }

          await trx('OB_REPORT_CONTENT').insert({
            REF_REPORT_ID: reportId,
            REF_VALUE_ID: valueIdData[i],
            CONTENT: content,
            CONTENT_OPTION: contentOption,
            FREE_VALUE_NAME: freeName,
            FREE_VALUE_UNIT: freeUnit,
            CONTENT_CREATE_DATE: timestamp,
            CONTENT_UPDATE_DATE: timestamp,
            CONTENT_OPTION_FREETEXT: freetext,
            CONTENT_OPTION_CHECKBOX: checkbox,
          })
        }
      }
    })

    // addLogs(req, {
    //   module: MODULE.REPORT,
    //   activity: 'Update Report',
    //   reportId,
    // })
    return true
  } catch (error) {
    handleErrorLog(`${fileModule} createReportContent(): ${error}`)
    return false
  }
}

async function deleteReportContent(reportId) {
  try {
    await db('OB_REPORT_CONTENT').del().where('REF_REPORT_ID', '=', reportId)
  } catch (error) {
    handleErrorLog(`${fileModule} deleteReportContent(): ${error}`)
  }
}

exports.getReportForm = async req => {
  try {
    let { templateId } = req.query
    templateId = parseInt(templateId)

    let data = await getMasterValueFromCache()
    data = data.filter(d => d.templateId === templateId)

    let newData = [...data]
    let length = data.length
    let op

    let masterOption = await getMasterOptionFromCache()
    masterOption = masterOption.filter(d => d.templateId === templateId)

    for (let i = 0; i < length; i++) {
      op = masterOption.filter(d => d.valueId === data[i].valueId)
      newData[i]['options'] = op
    }

    return newData
  } catch (error) {
    handleErrorLog(`${fileModule} getReportForm(): ${error}`)
  }
}

async function getReportOptions(valueId) {
  try {
    // const { valueId } = req.query
    const data = await db('OB_MASTER_OPTIONS')
      .select()
      // .leftJoin(
      //   'OB_MASTER_VALUE',
      //   'OB_MASTER_VALUE.VALUE_ID',
      //   'OB_REPORT_CONTENT.REF_VALUE_ID'
      // )
      .column([
        { opId: 'OP_ID' },
        { id: 'OP_ID' },
        { opName: 'OP_NAME' },
        // { label: 'OP_NAME' },
        { name: 'OP_DISPLAY_CONTENT' },
        { label: 'OP_DISPLAY_CONTENT' },
        { display: 'OP_DISPLAY_CONTENT' },
        { valueId: 'REF_VALUE_ID' },
        { templateId: 'REF_TEMPLATE_ID' },
      ])
      .where('REF_VALUE_ID', valueId)
      .andWhere('OP_NAME', '<>', '')
      .andWhere('OP_DISPLAY_CONTENT', '<>', '')
      .orderBy('OP_ORDER', 'asc')

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getReportOptions(): ${error}`)
  }
}

exports.getReportOptions = getReportOptions

async function prelimReport(req) {
  try {
    const { accession, hn } = req.body.bodyData
    const code = req.user.radName
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    console.log('prelimReport', accession, hn, code)

    const sql = `
    BEGIN TRANSACTION [P_${accession}]

    BEGIN TRY

        UPDATE PACS_STUDY
        SET STUDY_STATUS = 'D', 
        REQUEST_DOCTOR = '${code}', 
        OPERATORS_NAME = '${timestamp}'
        WHERE ACCESSION_NUMBER = '${accession}'

        UPDATE OB_REPORT
        SET REPORT_UPDATE_DATE = '${timestamp}'
        WHERE ACCESSION = '${accession}'

        UPDATE RIS_DIAGNOSTIC_REPORT
        SET REPORT_UPDATE_DATE = '${timestamp}'
        WHERE REF_ITEM_ID = '${accession}'

        UPDATE PACS_STUDY
        SET NAME_OF_PHYSICS_READING_STUDY = '${code}'
        WHERE ACCESSION_NUMBER = '${accession}'

        COMMIT TRANSACTION [P_${accession}]

    END TRY

    BEGIN CATCH

        ROLLBACK TRANSACTION [P_${accession}]

    END CATCH 
    `

    const result = await db.raw(sql)

    if (!result) return false

    req.body.bodyData['timestamp'] = timestamp
    req.body.bodyData['unofficial'] = 'yes'
    await createPdf(req)

    addLogs(req, {
      module: MODULE.REPORT,
      activity: 'Prelim',
      accession,
    })

    return timestamp

    // use transaction to avoid deadlock
    // return await db.transaction(async trx => {
    //   await updateReportStatus(trx, accession, code, 'D', timestamp)

    //   await trx('OB_REPORT')
    //     .update({
    //       REPORT_UPDATE_DATE: timestamp,
    //     })
    //     .where('ACCESSION', '=', accession)

    //   await trx('RIS_DIAGNOSTIC_REPORT')
    //     .update({
    //       REPORT_UPDATE_DATE: timestamp,
    //     })
    //     .where('REF_ITEM_ID', '=', accession)

    //   await trx('PACS_STUDY')
    //     .update({
    //       NAME_OF_PHYSICS_READING_STUDY: code,
    //     })
    //     .where('ACCESSION_NUMBER', '=', accession)

    //   /*
    //   let pacsData = await getPacsDataByAcc(accession)
    //   pacsData = pacsData[0]
    //   console.log('pacsData', pacsData)

    //   const requestDoctor = pacsData.REQUEST_DOCTOR // getByRadName
    //   const reportedDoctor = pacsData.REPORTED_DOCTOR
    //   const prelimDoctor = pacsData.NAME_OF_PHYSICS_READING_STUDY // if has value [Reported By] getByRadName
    //   const status = pacsData.STUDY_STATUS // if R and reportedDoctor has value [Verified By]
    //   */

    //   // create pdf and send to path unofficialResultPath  YYYYMMDDHHmmss$hn$accession.pdf
    //   await createPdf(req)

    //   addLogs(req, {
    //     module: MODULE.REPORT,
    //     activity: 'Prelim',
    //     accession,
    //   })

    //   return timestamp
    // })
  } catch (error) {
    handleErrorLog(`${fileModule} prelimReport(): ${error}`)
    return false
  }
}

exports.prelimReport = prelimReport

async function verifyReport(req) {
  try {
    const { accession, hn } = req.body.bodyData

    const code = req.user.radName
    const timestamp = dayjs().format('YYYYMMDDHHmmss')

    console.log('verifyReport', accession, hn, code, timestamp)

    const sql = `
    BEGIN TRANSACTION [R_${accession}]

    BEGIN TRY

        UPDATE PACS_STUDY
        SET STUDY_STATUS = 'R', 
        REQUEST_DOCTOR = '${code}', 
        OPERATORS_NAME = '${timestamp}'
        WHERE ACCESSION_NUMBER = '${accession}'

        UPDATE OB_REPORT
        SET REPORT_UPDATE_DATE = '${timestamp}'
        WHERE ACCESSION = '${accession}'

        UPDATE RIS_DIAGNOSTIC_REPORT
        SET REPORT_UPDATE_DATE = '${timestamp}'
        WHERE REF_ITEM_ID = '${accession}'

        UPDATE PACS_STUDY
        SET REPORTED_DOCTOR = '${code}'
        WHERE ACCESSION_NUMBER = '${accession}'

        COMMIT TRANSACTION [R_${accession}]

    END TRY

    BEGIN CATCH

        ROLLBACK TRANSACTION [R_${accession}]

    END CATCH 
    `

    const result = await db.raw(sql)

    if (!result) return false

    req.body.bodyData['timestamp'] = timestamp
    req.body.bodyData['unofficial'] = 'no'

    await createPdf(req)

    addLogs(req, {
      module: MODULE.REPORT,
      activity: 'Verify',
      accession,
    })

    return timestamp

    // use transaction to avoid deadlock
    // return await db.transaction(async trx => {
    //   await updateReportStatus(trx, accession, code, 'R', timestamp)

    //   await trx('OB_REPORT')
    //     .update({
    //       REPORT_UPDATE_DATE: timestamp,
    //     })
    //     .where('ACCESSION', '=', accession)

    //   await trx('RIS_DIAGNOSTIC_REPORT')
    //     .update({
    //       REPORT_UPDATE_DATE: timestamp,
    //     })
    //     .where('REF_ITEM_ID', '=', accession)

    //   // ERROR: deadlock occurred
    //   await trx('PACS_STUDY')
    //     .update({
    //       REPORTED_DOCTOR: code,
    //     })
    //     .where('ACCESSION_NUMBER', '=', accession)

    //   /*
    //   let pacsData = await getPacsDataByAcc(accession)
    //   pacsData = pacsData[0]
    //   console.log('pacsData', pacsData)

    //   const requestDoctor = pacsData.REQUEST_DOCTOR // getByRadName
    //   const reportedDoctor = pacsData.REPORTED_DOCTOR
    //   const prelimDoctor = pacsData.NAME_OF_PHYSICS_READING_STUDY // if has value [Reported By] getByRadName
    //   const status = pacsData.STUDY_STATUS // if R and reportedDoctor has value [Verified By]
    //   */

    //   // create pdf and send to path uniwebResultPath YYYYMMDDHHmmss$hn$accession.pdf
    //   await createPdf(req)

    //   addLogs(req, {
    //     module: MODULE.REPORT,
    //     activity: 'Verify',
    //     accession,
    //   })

    //   return timestamp
    // })
  } catch (error) {
    handleErrorLog(`${fileModule} verifyReport(): ${error}`)
    return false
  }
}

exports.verifyReport = verifyReport

async function getPacsDataByAcc(accession) {
  try {
    const data = await db('PACS_STUDY').where(
      'ACCESSION_NUMBER',
      '=',
      accession
    )

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getPacsDataByAcc(): ${error}`)
  }
}

exports.getPacsDataByAcc = getPacsDataByAcc

async function updateReportStatus(db, accession, code, status, timestamp) {
  try {
    // ERROR: deadlock occurred
    await db('PACS_STUDY')
      .update({
        STUDY_STATUS: status,
        REQUEST_DOCTOR: code,
        OPERATORS_NAME: timestamp,
      })
      .where('ACCESSION_NUMBER', '=', accession)

    return true
  } catch (error) {
    handleErrorLog(`${fileModule} updateReportStatus(): ${error}`)
  }
}

exports.updateReportStatus = updateReportStatus

exports.updateReportContentValue = async req => {
  // console.log('updateReportContentValue')
  const { reportId, value, name } = req.body
  try {
    let refValueId = await db('OB_MASTER_VALUE')
      .column({
        valueId: 'VALUE_ID',
      })
      .where('VALUE_NAME', name)

    refValueId = refValueId[0].valueId

    let checkIfExist = await db('OB_REPORT_CONTENT')
      .select()
      .where('REF_REPORT_ID', reportId)
      .andWhere('REF_VALUE_ID', refValueId)

    // console.log(reportId, refValueId, value)

    if (!value) {
      if (checkIfExist.length > 0) {
        await db('OB_REPORT_CONTENT')
          .where('REF_REPORT_ID', reportId)
          .andWhere('REF_VALUE_ID', refValueId)
          .del()
        // console.log('DELETE')
      }

      return true
    }

    if (checkIfExist.length > 0) {
      if (checkIfExist[0].CONTENT !== value + '') {
        // console.log('UPDATE')
        await db('OB_REPORT_CONTENT')
          .update({
            CONTENT: value + '',
          })
          .where('REF_REPORT_ID', reportId)
          .andWhere('REF_VALUE_ID', refValueId)
      }
    } else {
      //insert
      // console.log('INSERT')
      const timestamp = dayjs().format('YYYYMMDDHHmmss')
      await db('OB_REPORT_CONTENT').insert({
        REF_REPORT_ID: reportId,
        REF_VALUE_ID: refValueId,
        CONTENT: value + '',
        CONTENT_CREATE_DATE: timestamp,
        CONTENT_UPDATE_DATE: timestamp,
        CONTENT_OPTION: 0,
      })
    }

    return true
  } catch (error) {
    handleErrorLog(`${fileModule} updateReportContentValue(): ${error}`)
  }
}

exports.getEfwByHN = async req => {
  try {
    const { hn, accession, fetusNo } = req.query
    const data = await db('PACS_STUDY')
      .select()
      .column([
        { accession: 'ACCESSION_NUMBER' },
        { edcGa: 'OB_EDC_GA' },
        { edc: 'OB_EDC' },
        { usGa: 'OB_US_GA' },
        { usEdc: 'OB_US_EDC' },
        { noFetus: 'OB_NO_FETUS' },
        { reportId: 'REPORT_ID' },
      ])
      .leftJoin(
        'OB_STUDY',
        'OB_STUDY.OB_ACCESSION',
        'PACS_STUDY.ACCESSION_NUMBER'
      )
      .leftJoin('OB_REPORT', 'OB_STUDY.OB_ACCESSION', 'OB_REPORT.ACCESSION')
      // .whereNotNull('OB_EDC')
      // .andWhere('OB_EDC', '<>', '')
      .where('PATIENT_ID', hn)
      .andWhere('REF_TEMPLATE_ID', '1')
      .andWhere('OB_STUDY_TYPE', '1')
      .andWhere('REPORT_FETUS_NO', fetusNo)
      // .orderBy('OB_EDC', 'desc')
      .orderBy([
        { column: 'OB_EDC', order: 'desc' },
        { column: 'OB_US_EDC', order: 'desc' },
      ])

    //   let sql = `
    //     select ACCESSION_NUMBER accession ,OB_EDC_GA edcGa,OB_EDC edc,OB_NO_FETUS noFetus,REPORT_ID reportId
    //     from PACS_STUDY
    //     left join OB_STUDY on OB_STUDY.OB_ACCESSION = PACS_STUDY.ACCESSION_NUMBER
    //     left join OB_REPORT on OB_STUDY.OB_ACCESSION = OB_REPORT.ACCESSION
    //     WHERE PATIENT_ID = '${hn}'
    //     AND REF_TEMPLATE_ID = 1
    //     AND OB_STUDY_TYPE = 1
    //     AND REPORT_FETUS_NO = ${fetusNo}
    //     ORDER BY OB_EDC DESC
    // `
    // console.log(data)
    let dataHasEdc = data.filter(d => d.edc || d.usEdc)
    // console.log('dataHasEdc', dataHasEdc)

    if (dataHasEdc.length === 0) return { data: [] }

    let dateCheck = dataHasEdc[0]?.edc || dataHasEdc[0]?.usEdc

    let edcDate = dayjs(dateCheck).add(-300, 'days').format('YYYYMMDD')

    let newData = dataHasEdc.filter(d => {
      return (d.edc && d.edc >= edcDate) || (d.usEdc && d.usEdc >= edcDate)
    })

    // console.log('newData', newData)

    let reportIdArr = newData.map(d => d.reportId)
    // console.log('reportIdArr', reportIdArr)

    let targetEfw = EFW_CHARTS[process.env.EFW_CHARTS || 'HL3']

    let fw = await db('OB_REPORT_CONTENT')
      .select()
      .column([{ value: 'CONTENT' }, { reportId: 'REF_REPORT_ID' }])
      .whereNotNull('CONTENT')
      .whereIn('REF_REPORT_ID', reportIdArr)
      .andWhere('REF_VALUE_ID', targetEfw)
      .orderBy('CONTENT_ID', 'asc')

    // console.log(fw)

    fw = fw.map(d => {
      let n = newData.find(e => e.reportId === d.reportId)
      let ga = n.edcGa ? n.edcGa.split('w')[0] : n.usGa.split('w')[0]

      return { fw: parseFloat(d.value), ga }
    })

    return {
      data: fw,
      efwPath: await exists(
        `${process.env.IMAGES_PATH}/efw/${accession}/${fetusNo}/efw.jpg`
      ),
      // ? `/api/v1/files/efw?accession=${accession}&fetusNo=${fetusNo}&r=${Math.random()}`
      // : false,
    }
  } catch (error) {
    handleErrorLog(`${fileModule} getEfwByHN(): ${error}`)
  }
}
