import axios from 'axios'
import printJS from 'print-js'
import htmlToPdfmake from 'html-to-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake'

import { API, FETUS_NAME, STORAGE_NAME, TEMPLATES } from '../../config'

import { getReportConfigTemplate1, reportByTemplate1 } from './report-setting'

import {
  reFormatFullDate,
  getDoctorName,
  convertDateTimeFormat,
  capitalizeSentence,
  sleep,
} from '../../utils'
import { autoSave, autoSave2, autoSave3, updateDataChange } from './helper'
import { isEmpty } from 'lodash'
import doppler_uma_pi_95p from '../../data/doppler_uma_pi_95p'

export const REPORT_TEMPLATE = {
  RVH: {
    template: getReportConfigTemplate1,
    headerImgFit: [545, 84],
    headerMarginTop: 10,
    pageSize: 'A4',
    orientation: 'portrait',
    footer: {
      hasReportByFooter: true,
      reportByFooter: reportByTemplate1,
      hasPageNum: true,
    },
  },
}

let PATIENT_INFO = null

const gynTemplateId = [33, 40, 34, 35, 36, 37, 38]

const obTemplateId = [
  4, 5, 6, 39, 7, 8, 9, 3, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 41, 42, 43, 44, 45, 46,
]

function getSiteInfo(sysProps, patientInfo) {
  if (!sysProps && !patientInfo) return null

  let { hspName } = sysProps

  if (!(hspName in REPORT_TEMPLATE)) {
    alert(`Error: hsp name "${hspName}" not set in report template`)
    return null
  }

  return REPORT_TEMPLATE[hspName].template(patientInfo)
}

export const docDefination = async (sysProps, data) => {
  try {
    const siteInfo = getSiteInfo(sysProps, data)

    let { hspName } = sysProps

    if (!siteInfo) {
      return console.error(
        `Error: hsp name "${hspName}" not set in report template`
      )
    }

    let reportHeaderImg = await getHeaderImage(sysProps.reportHeaderPath)

    return {
      info: {
        title: 'view',
      },
      pageSize: REPORT_TEMPLATE[hspName].pageSize,
      pageMargins: siteInfo.pageMargins,
      pageOrientation: REPORT_TEMPLATE[hspName].orientation,
      //set patient info to header
      header: [
        {
          image: reportHeaderImg,
          fit: REPORT_TEMPLATE[hspName].headerImgFit,
          alignment: 'center',
          marginTop: REPORT_TEMPLATE[hspName].headerMarginTop || 5,
          // margin: [0, REPORT_TEMPLATE[hspName].headerMarginTop, 0, 0],
        },
        ...siteInfo.header,
      ],
      footer: function (currentPage, pageCount) {
        if (!REPORT_TEMPLATE[hspName].footer.hasPageNum) return

        const footer = [
          // {
          //   canvas: [
          //     {
          //       type: 'line',
          //       lineWidth: 0.5,
          //       x1: 0,
          //       x2: 538,
          //       y1: 0,
          //       y2: 0,
          //       lineColor: '#000000',
          //     },
          //   ],
          //   margin: [28, 3, 0, 0],
          // },
          {
            text:
              pageCount > 0
                ? `Page : ${currentPage.toString()} of ${pageCount}`
                : '',
            alignment: 'center',
            marginTop: 7,
          },
        ]

        return footer
      },
      // content: html,
      styles: {
        tablePatientInfo: {
          margin: [30, -5, 49, 0],
        },
        mesInfo: {
          margin: [0, 0, 0, 0],
        },

        defaultFont: {
          fontSize: 12,
        },
        defaultSmallFont: {
          fontSize: 11.5,
        },
        defaultSmallerFont: {
          fontSize: 11,
        },
        defaultSmallestFont: {
          fontSize: 10,
        },
        defaultSmallFontHeader: {
          fontSize: 8.5,
        },

        defaultThaiFont: {
          font: 'THSaraban',
          fontSize: 17,
          bold: true,
        },
      },
      defaultStyle: {
        font: 'Tahoma',
        fontSize: 12,
        lineHeight: 1.1,
      },
    }
  } catch (error) {
    console.error(error)
  }
}

async function getHeaderImage(path) {
  let headerImage = ''

  if (
    window.localStorage.getItem(STORAGE_NAME.imageHeaderStorage) &&
    window.localStorage.getItem(STORAGE_NAME.imageHeaderStorage).length > 0
  ) {
    headerImage = window.localStorage.getItem(STORAGE_NAME.imageHeaderStorage)
  } else {
    headerImage = await axios.get(`${API.IMAGE_BASE64}?path=${path}`)
    headerImage = headerImage.data
    window.localStorage.setItem(STORAGE_NAME.imageHeaderStorage, headerImage)
  }

  return headerImage
}

export function hasReportBy(
  hspName,
  status,
  consultDoctor,
  reportedDoctor,
  verifiedDoctor,
  html,
  timestampReported,
  type
) {
  // console.log('reportedDoctor', reportedDoctor)
  // console.log('verifiedDoctor', verifiedDoctor)

  const hasReportBy = REPORT_TEMPLATE[hspName].footer.hasReportByFooter
    ? REPORT_TEMPLATE[hspName].footer.reportByFooter({
        status,
        consultDoctor,
        reportedDoctor,
        verifiedDoctor,
        timestampReported,
        type,
      })
    : null

  let fillContent = [...html]
  if (hasReportBy) {
    fillContent = [...html, ...hasReportBy]
  }

  return fillContent
}

export async function getTimestampReported() {
  const response = await axios.get(API.SERVER_TIME)
  const timestampReported = reFormatFullDate(response.data.data.serverTime)

  return [
    `${timestampReported[0]} ${timestampReported[1]}`,
    response.data.data.serverTime,
  ]
}

export function getReportBy(type, doctor, patient, user) {
  const d = getDoctorName(
    doctor,
    type === 'prelim'
      ? patient.prelimDoctor ||
          patient.reportedDoctor ||
          patient.reportedByCode ||
          user?.code
      : patient.reportedDoctor || patient.verifiedByCode || user?.code || ''
  )[0]

  let notExistName =
    type === 'prelim'
      ? patient.prelimDoctor || patient.reportedDoctor || patient.reportedByCode
      : patient.reportedDoctor || patient.verifiedByCode

  return `${d?.desc || d?.descEng || ''} (${
    d?.signerName || notExistName || ''
  })`
}

export async function getDocDef(
  type,
  data,
  systemProperties,
  doctor,
  user,
  setTemplateNotification = null
) {
  try {
    // type = preview,prelim,verify,worklist
    // console.log(type)
    // console.log(data)
    let res
    let isSaveSuccess = true

    // click print from worklist
    if (type !== 'worklist') {
      if (
        !['editor', 'image', 'EFWCharts'].includes(
          window.localStorage.getItem(STORAGE_NAME.lastActiveTab)
        )
      ) {
        let newForm = window.localStorage.getItem(
          STORAGE_NAME.lastActiveTabData
        )

        if (!newForm) return alert('Invalid data')
        if (
          window.localStorage.getItem(STORAGE_NAME.isProcedureDataChange) ===
          '1'
        ) {
          let newForm3 = window.localStorage.getItem(
            STORAGE_NAME[
              window.localStorage.getItem(STORAGE_NAME.activeProcedure)
            ]
          )
          // console.log(newForm3)

          await autoSave2(JSON.parse(newForm3))
        }

        if (window.localStorage.getItem(STORAGE_NAME.isDataChange) === '1') {
          res = await autoSave(JSON.parse(newForm), null, {
            accession: data.accession,
            currentFetus: data.currentFetus,
            isInvasive:
              window.localStorage.getItem(STORAGE_NAME.lastActiveTab) === '8'
                ? true
                : undefined,
          })
          if (!res) isSaveSuccess = false

          let newForm2 = window.localStorage.getItem(
            STORAGE_NAME.lastActiveTabData2
          )
          // console.log(newForm2)
          if (newForm2) {
            updateDataChange('1')
            res = await autoSave(JSON.parse(newForm2), null, {
              accession: data.accession,
              currentFetus: data.currentFetus,
            })
          }
        }

        if (window.localStorage.getItem(STORAGE_NAME.isCvlDataChange) === '1') {
          let newForm = window.localStorage.getItem(
            STORAGE_NAME.lastActiveTabData4
          )

          await autoSave3(JSON.parse(newForm))
        }
      }
    }

    if (!isSaveSuccess) return

    res = await axios.get(API.REPORT_DATA, {
      params: {
        accession: data.accession,
        studyType: data.obStudyType,
      },
    })

    const report = res.data.data
    let consultList = report.consultant.map(d => d.radName)
    consultList = doctor.filter(d => consultList.includes(d.radName))

    const updatedPatient = {
      ...data,
      ...report.patientInfo,
    }

    let timestampReported = report.reportTimestamp

    if (data.status === 'N' || ['prelim', 'verify'].includes(type)) {
      // console.log('actual time')
      timestampReported = await getTimestampReported()
      timestampReported = timestampReported[1]
    }
    // console.log(data)
    const prelimBy = getReportBy('prelim', doctor, updatedPatient, user)
    const verifyBy = getReportBy('verify', doctor, updatedPatient, user)

    // let diagContent = window.localStorage.getItem(STORAGE_NAME.diagReport)
    let latestContent = ''
    if (window.localStorage.getItem(STORAGE_NAME.lastActiveTab) === 'editor') {
      // console.log('save report')
      if (window.localStorage.getItem(STORAGE_NAME.isDataChange) === '1') {
        // console.log('data changed')
        let c = window.localStorage.getItem(STORAGE_NAME.diagReport)
        if (c === '<p>&nbsp;</p>') c = ''

        latestContent = c
        // if (c) {
        await axios.post(API.DIAG_REPORT, {
          accession: updatedPatient.accession,
          content: c,
        })
        updateDataChange('0')
        // }
      }
    }

    if (
      setTemplateNotification &&
      systemProperties?.showTabDataChecked === 'YES'
    ) {
      // console.log('setTemplateNotification')
      let fetus = window.localStorage.getItem(STORAGE_NAME.activeFetus)

      res = await axios.get(API.TEMPLATE_DATA, {
        params: { accession: data.accession, fetus },
      })

      setTemplateNotification(res.data.data)
    }

    let diagContent = latestContent || report.reportContent
    let reportSearchContent = ''

    let html = []
    if (diagContent) {
      // console.log(diagContent)
      diagContent = reFormatSpace(cleanUpContent(diagContent))
      reportSearchContent = diagContent
      html = htmlToPdfmake(diagContent)
    }

    diagContent = ''
    const templates = {
      // 1 OB
      1: [
        TEMPLATES.anc.name,
        TEMPLATES.earlyPregnancy.name,
        TEMPLATES.anatomicalScan.name,
        TEMPLATES.cervical.name,
        TEMPLATES.bpp.name,
        TEMPLATES.invasivePrerequisite.name,
        // TEMPLATES.invasiveAmniocentesis.name,
        TEMPLATES.fetalEcho.name,
        TEMPLATES.obDiagnosis.name,
      ],
      // 2 GYN
      2: [
        TEMPLATES.uterus.name,
        TEMPLATES.ovaries.name,
        TEMPLATES.abnormalMass.name,
        TEMPLATES.kidneys.name,
        TEMPLATES.follicleScreen.name,
        TEMPLATES.gynDiagnosis.name,
      ],
    }
    // let data
    // console.log(updatedPatient.currentFetus)
    // console.log('template', templates)
    // console.log(report.reportTemplate)
    // console.log('updatedPatient', updatedPatient)
    templates[updatedPatient.obStudyType]?.forEach(async tname => {
      let fetus = parseInt(updatedPatient.noFetus)

      let data = []
      for (let i = 1; i <= 4; i++) {
        data = report.reportTemplate[i][TEMPLATES[tname].id]
        if (data?.length > 0) break
      }

      if (data?.length > 0) {
        html = [
          ...html,
          ...findingsTemplate2pdfmake(report.reportTemplate, tname, fetus),
        ]
      }
    })

    // console.log(report.reportTemplate)
    // for report search save only comment
    if (['prelim', 'verify', 'preview'].includes(type)) {
      reportSearchContent += createHtml(
        report.reportTemplate,
        data.obStudyType,
        data.noFetus
      )
    }

    const defination = await docDefination(systemProperties, {
      patient: updatedPatient,
      timestampReported,
    })

    const by = hasReportBy(
      systemProperties.hspName,
      updatedPatient.status,
      consultList,
      prelimBy, // check pacsData.NAME_OF_PHYSICS_READING_STUDY
      verifyBy, // verify
      [],
      timestampReported,
      type
    )

    const [wImages, imgSources] = attachImages(
      report.imagesSelected,
      systemProperties,
      type
    )

    const [efw, efwSources] = attachEfw(report.efwCharts, systemProperties)

    const docDef = {
      ...defination,
      content: [
        ...fillOBmesurements(updatedPatient),
        ...fill2DMesurement(
          report,
          updatedPatient.noFetus,
          updatedPatient.obStudyType
        ),
        ...html,
        ...by,
        ...wImages,
        ...efw,
      ],
      indication: combineIndications(updatedPatient),
      consultList,
      prelimBy,
      verifyBy,
      images: { ...imgSources, ...efwSources },
    }

    return [docDef, reportSearchContent]
  } catch (error) {
    console.log(error)
  }
}

function anatomical(r, data, templateId, valueName) {
  let hasDetail =
    data[templateId]?.find(d => ['Other', 'Comments'].includes(d.valueName)) ||
    false

  if (!hasDetail) return r

  let detail = r.find(r => r.valueName === valueName)
  let index = r.findIndex(e => {
    if (e.valueName === valueName) return e.valueName === valueName
  })

  r = r.filter(r => r.valueName !== valueName)
  r.splice(index, 0, {
    content: hasDetail.content,
    display: `${valueName} ${
      detail.contentOptionDisplay === 'Details'
        ? ''
        : detail.contentOptionDisplay
    }`,
    displayStyle: 'row',
    // color: detail.contentOptionDisplay === 'Abnormal' ? 'red' : '',
    type: 'A',
  })

  return r
}

function getProcedureName(data, name, isOneProcedure) {
  let procedureName = data.find(p => p.contentOptionDisplay === name)
  return { ...procedureName, displayStyle: 'row', underline: !isOneProcedure }
}

// modify specific value
function modifyReport(report, templateId, data) {
  let r = report

  if (templateId === TEMPLATES['obDiagnosis'].id) {
    let combineFetusDiagnosis = ''
    let combineMotherDiagnosis = ''
    const findFetusDiagnosis = r.filter(r => [69, 146].includes(r.valueId))
    const findMotherDiagnosis = r.filter(r => [72, 147].includes(r.valueId))
    if (findFetusDiagnosis.length > 0) {
      combineFetusDiagnosis += findFetusDiagnosis
        .map(d => {
          if (d.valueId === 69) return d.contentOptionDisplay

          return d.content
        })
        .join(', ')

      let newValue = r.filter(r => ![69, 146].includes(r.valueId))
      r = newValue
      newValue.unshift({
        content: combineFetusDiagnosis,
        type: 'T',
        valueId: 69,
        display: 'Diagnosis(Fetus)',
        displayStyle: 'row',
      })
    }

    if (findMotherDiagnosis.length > 0) {
      combineMotherDiagnosis += findMotherDiagnosis
        .map(d => {
          if (d.valueId === 72) return d.contentOptionDisplay

          return d.content
        })
        .join(', ')

      let index = r.findIndex(e => {
        if (e.valueId === 72) return e.valueId === 72

        return e.valueId === 147
      })

      let newValue = r.filter(r => ![72, 147].includes(r.valueId))
      r = newValue
      r.splice(index, 0, {
        content: combineMotherDiagnosis,
        type: 'T',
        valueId: 72,
        display: 'Diagnosis(Mother)',
        displayStyle: 'row',
      })
    }
  }

  if (templateId === TEMPLATES['earlyPregnancy'].id) {
    // console.log(data)
    let hasCordDetail =
      data[TEMPLATES['cordAbnormal'].id]?.find(d => d.valueName === 'Other') ||
      false

    if (hasCordDetail) {
      // console.log(hasCordDetail)
      // console.log(r)
      let cord = r.find(r => r.valueName === 'Cord')
      let index = r.findIndex(e => {
        if (e.valueName === 'Cord') return e.valueName === 'Cord'
      })

      r = r.filter(r => r.valueName !== 'Cord')
      r.splice(index, 0, {
        content: hasCordDetail.content,
        display: `Cord ${
          cord.contentOptionDisplay === 'Details'
            ? ''
            : cord.contentOptionDisplay
        }`,
        displayStyle: 'row',
        // color: cord.contentOptionDisplay === 'Abnormal' ? 'red' : '',
        type: 'A',
      })
    }
  }

  if (templateId === TEMPLATES['anatomicalScan'].id) {
    // console.log(data)
    r = anatomical(
      r,
      data,
      TEMPLATES['headShapeAnatomicalAbnormal'].id,
      'Head Shape'
    )

    r = anatomical(r, data, TEMPLATES['gitAnatomicalAbnormal'].id, 'GI Tract')
    r = anatomical(r, data, TEMPLATES['brainAnatomicalAbnormal'].id, 'Brain')
    r = anatomical(
      r,
      data,
      TEMPLATES['kidneysAnatomicalAbnormal'].id,
      'Kidneys'
    )
    r = anatomical(r, data, TEMPLATES['faceAnatomicalAbnormal'].id, 'Face')
    r = anatomical(r, data, TEMPLATES['spineAnatomicalAbnormal'].id, 'Spine')
    r = anatomical(
      r,
      data,
      TEMPLATES['neckSkinAnatomicalAbnormal'].id,
      'Neck/Skin'
    )
    r = anatomical(
      r,
      data,
      TEMPLATES['skeletonAnatomicalAbnormal'].id,
      'Skeleton'
    )

    r = anatomical(r, data, TEMPLATES['thoraxAnatomicalAbnormal'].id, 'Thorax')
    r = anatomical(
      r,
      data,
      TEMPLATES['extremitiesAnatomicalAbnormal'].id,
      'Extremities'
    )
    r = anatomical(r, data, TEMPLATES['heartAnatomicalAbnormal'].id, 'Heart')
    r = anatomical(r, data, TEMPLATES['cordAnatomicalAbnormal'].id, 'Cord')
    r = anatomical(
      r,
      data,
      TEMPLATES['abdomenAnatomicalAbnormal'].id,
      'Abdomen'
    )
    r = anatomical(
      r,
      data,
      TEMPLATES['genitaliaAnatomicalAbnormal'].id,
      'Genitalia'
    )
  }

  if (templateId === TEMPLATES['cervical'].id) {
    let findType = r.find(d => d.display === 'Measurement Type')
    let findShape = r.find(d => d.display === 'Shape')
    let findFreetext = r.find(d => d.display === 'Freetext')
    if (findFreetext) findFreetext.display = 'Shape'

    r = r
      .filter(d => d.display !== 'Measurement Type')
      .map(d => {
        if (d.display === 'Shortest Measurement') {
          if (data[1] && data[1].length > 0) {
            let findCvl = data[1].find(d => d.valueName === 'CVL')
            if (findCvl) {
              return {
                content:
                  findCvl.content +
                  ' ' +
                  findCvl.unit +
                  `${findType ? ` (${findType.contentOptionDisplay})` : ''}`,
                display: 'Shortest Measurement',
                displayStyle: 'col',
                type: 'T',
              }
            }
          }
          return d
        }

        return d
      })

    if (findShape && findFreetext) {
      r = r
        .filter(d => d.valueName !== 'Freetext')
        .map(d => ({
          ...d,
          contentOptionDisplay:
            d.contentOptionDisplay + ', ' + findFreetext.content,
        }))
    }
  }

  if (templateId === TEMPLATES['gynDiagnosis'].id) {
    let combineDiagnosis = ''
    const findDiagnosis = r.filter(r => [630, 646].includes(r.valueId))
    if (findDiagnosis.length > 0) {
      combineDiagnosis += findDiagnosis
        .map(d => {
          if (d.valueId === 630) return d.contentOptionDisplay

          return d.content
        })
        .join(', ')

      let newValue = r.filter(r => ![630, 646].includes(r.valueId))
      r = newValue
      newValue.unshift({
        content: combineDiagnosis,
        type: 'T',
        valueId: 630,
        display: 'Diagnosis',
        displayStyle: 'row',
      })
    }
  }

  if (templateId === TEMPLATES['invasivePrerequisite'].id) {
    r = r.map(d => {
      if (d.valueName === 'Indications for invasive procedure') {
        if (
          d.content.indexOf('chromosomal abnormality') > -1 ||
          d.content.indexOf('Other:') > -1
        ) {
          let freetext1 =
            r.find(d => d.valueName === 'ind freetext 1')?.content || ''
          let freetext2 =
            r.find(d => d.valueName === 'ind freetext 2')?.content || ''
          let t = d.content.trim().split(', ')

          t = t.map(d => {
            if (d.indexOf('chromosomal abnormality') > -1) {
              return d.split(':')[0] + ': ' + freetext1
            } else if (d.indexOf('Other:') > -1) {
              return freetext2
            }
            return d
          })

          return { ...d, content: t.join(', ') }

          // if (t.length > 1 && t[1] !== '') {
          //   return { ...d, content: t.join(':') }
          // }

          // return { ...d, content: t[0] }
        }

        return { ...d, content: d.content?.replace('Other: ', '') }
      }

      return d
    })

    r = r.filter(d => !d.valueName.includes('ind freetext'))

    let antiDimmun = r.find(
      d => d.valueName === 'Anti-D immunoglobulin'
    )?.contentOptionDisplay
    if (antiDimmun === 'Yes') {
      let quantity = r.find(d => d.valueName === 'Quantity')
      // console.log(quantity)
      if (quantity) {
        r = r.filter(d => d.valueName !== 'Quantity')

        r = r.map(d => {
          if (d.valueName === 'Anti-D immunoglobulin') {
            return {
              ...d,
              content: `${d.contentOptionDisplay}, ${quantity.content}`,
            }
          }

          return d
        })
      }
    }

    let contraindications = r.find(
      d => d.valueName === 'Contraindications'
    )?.contentOptionDisplay
    if (contraindications === 'Other') {
      let text = r.find(d => d.valueName === 'Contraindications Text')?.content
      if (text) {
        r = r.filter(d => d.valueName !== 'Contraindications Text')

        r = r.map(d => {
          if (d.valueName === 'Contraindications') {
            return { ...d, content: text }
          }

          return d
        })
      }
    }

    let indication = r.find(
      d => d.valueName === 'Indications for invasive procedure'
    )?.content
    if (indication) {
      r = r.map(d => {
        if (d.valueName === 'Indications for invasive procedure') {
          return { ...d, content: indication.replace('Other:', '') }
        }

        return d
      })
    }

    // let procedure = r.find(d => d.valueName === 'Procedure')
    // if (procedure?.contentOptionDisplay === 'Other') {
    //   let text = r
    //     .find(d => d.valueName === 'Other Procedure')
    //     ?.content.replace(/<br\s*[/]?>/gi, '\n')
    //   r = r.filter(d => d.valueName !== 'Other Procedure')

    //   r = r.map(d => {
    //     if (d.valueName === 'Procedure') {
    //       return { ...d, content: text || '' }
    //     }

    //     return d
    //   })
    // }
    // console.log(r)
    let procedureArr = r
      .filter(d => d.valueName === 'Procedure')
      .sort((a, b) => a.contentOption - b.contentOption)

    if (procedureArr[0]?.contentOptionDisplay === 'Other') {
      let text = r
        .find(d => d.valueName === 'Other Procedure')
        ?.content.replace(/<br\s*[/]?>/gi, '\n')
      r = r.filter(d => d.valueName !== 'Other Procedure')

      r = r.map(d => {
        if (d.valueName === 'Procedure') {
          return { ...d, content: text || '', displayStyle: 'row' }
        }

        return d
      })

      return r
    }

    const prerequistData = [...r]

    //remove Procedure from prerequistData
    r = r.filter(d => d.valueName !== 'Procedure')
    let procedureName
    for (let i = 0; i < procedureArr.length; i++) {
      let procedure = procedureArr[i]
      if (
        [
          'Amniocentesis',
          'CVS',
          'Cordocentesis',
          'Intrauterine Transfusion',
        ].includes(procedure?.contentOptionDisplay)
      ) {
        const procedureMap = {
          Amniocentesis: '42',
          CVS: '43',
          Cordocentesis: '44',
          'Intrauterine Transfusion': '45',
        }
        let procedureData = data[procedureMap[procedure.contentOptionDisplay]]

        if (
          procedureData &&
          procedure.contentOptionDisplay === 'Amniocentesis'
        ) {
          procedureName = getProcedureName(
            prerequistData,
            procedure.contentOptionDisplay,
            procedureArr.length === 1
          )

          r = [...r, procedureName, ...procedureData]

          let uterusAbnormalDetails = r.find(
            d => d.valueName === 'Uterus Abnormal Details'
          )
          if (uterusAbnormalDetails?.content) {
            r = r.map(d => {
              if (d.valueName === 'Uterus') {
                return {
                  ...d,
                  content: `${d.contentOptionDisplay}, ${uterusAbnormalDetails.content}`,
                }
              }

              return d
            })

            r = r.filter(d => d.valueName !== 'Uterus Abnormal Details')
          }

          let instrumentText = r.find(d => d.valueName === 'Instrument Text')
          if (instrumentText?.content) {
            r = r.map(d => {
              if (d.valueName === 'Instrument') {
                return {
                  ...d,
                  content: `${instrumentText.content}`,
                }
              }

              return d
            })

            r = r.filter(d => d.valueName !== 'Instrument Text')
          }

          let complication = r.find(d => d.valueName === 'Complication')
          if (complication?.contentOptionDisplay === 'Define') {
            r = r.map(d => {
              if (d.valueName === 'Complication') {
                return {
                  ...d,
                  content: `${
                    r.find(d => d.valueName === 'Complication Define')
                      ?.content || ''
                  }`,
                }
              }

              return d
            })
          }

          r = r.filter(d => d.valueName !== 'Complication Define')

          r = r.map(d => {
            if (d.valueName === 'Amniotic fluid test for') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 20) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Post procedure instructions') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 18) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            }

            return d
          })
        } else if (procedureData && procedure.contentOptionDisplay === 'CVS') {
          procedureName = getProcedureName(
            prerequistData,
            procedure.contentOptionDisplay,
            procedureArr.length === 1
          )

          r = [...r, procedureName, ...procedureData]

          let uterusAbnormalDetails = r.find(
            d => d.valueName === 'Uterus Abnormal Details'
          )
          if (uterusAbnormalDetails?.content) {
            r = r.map(d => {
              if (d.valueName === 'Uterus') {
                return {
                  ...d,
                  content: `${d.contentOptionDisplay}, ${uterusAbnormalDetails.content}`,
                }
              }

              return d
            })

            r = r.filter(d => d.valueName !== 'Uterus Abnormal Details')
          }

          let instrumentText = r.find(d => d.valueName === 'Instrument Text')
          if (instrumentText?.content) {
            r = r.map(d => {
              if (d.valueName === 'Instrument') {
                return {
                  ...d,
                  content: `${instrumentText.content}`,
                }
              }

              return d
            })

            r = r.filter(d => d.valueName !== 'Instrument Text')
          }

          let complication = r.find(d => d.valueName === 'Complication')
          if (complication?.contentOptionDisplay === 'Define') {
            r = r.map(d => {
              if (d.valueName === 'Complication') {
                return {
                  ...d,
                  content: `${
                    r.find(d => d.valueName === 'Complication Define')
                      ?.content || ''
                  }`,
                }
              }

              return d
            })
          }

          r = r.filter(d => d.valueName !== 'Complication Define')

          r = r.map(d => {
            if (d.valueName === 'CVS sampling tissue test for') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 20) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Post procedure instructions') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 18) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Entries uterus') {
              return {
                ...d,
                display: 'No. of uterine entry',
              }
            }

            return d
          })
        } else if (
          procedureData &&
          procedure.contentOptionDisplay === 'Cordocentesis'
        ) {
          procedureName = getProcedureName(
            prerequistData,
            procedure.contentOptionDisplay,
            procedureArr.length === 1
          )
          r = [...r, procedureName, ...procedureData]

          let instrumentText = r.find(d => d.valueName === 'Instrument Text')
          if (instrumentText?.content) {
            r = r.map(d => {
              if (d.valueName === 'Instrument') {
                return {
                  ...d,
                  content: `${instrumentText.content}`,
                }
              }

              return d
            })

            r = r.filter(d => d.valueName !== 'Instrument Text')
          }

          let complication = r.find(d => d.valueName === 'Complication')
          if (complication?.contentOptionDisplay === 'Define') {
            r = r.map(d => {
              if (d.valueName === 'Complication') {
                return {
                  ...d,
                  content: `${
                    r.find(d => d.valueName === 'Complication Define')
                      ?.content || ''
                  }`,
                }
              }

              return d
            })
          }

          r = r.filter(d => d.valueName !== 'Complication Define')

          r = r.map(d => {
            if (d.valueName === 'Cordocentesis test for') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 20) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Post procedure instructions') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 18) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Entries uterus') {
              return {
                ...d,
                display: 'No. of uterine entry',
              }
            } else if (d.valueName === 'Sampling Site') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 25) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            }

            return d
          })
        } else if (
          procedureData &&
          procedure.contentOptionDisplay === 'Intrauterine Transfusion'
        ) {
          procedureName = getProcedureName(
            prerequistData,
            procedure.contentOptionDisplay,
            procedureArr.length === 1
          )
          r = [...r, procedureName, ...procedureData]

          let instrumentText = r.find(d => d.valueName === 'Instrument Text')
          if (instrumentText?.content) {
            r = r.map(d => {
              if (d.valueName === 'Instrument') {
                return {
                  ...d,
                  content: `${instrumentText.content}`,
                }
              }

              return d
            })

            r = r.filter(d => d.valueName !== 'Instrument Text')
          }

          let complication = r.find(d => d.valueName === 'Complication')
          if (complication?.contentOptionDisplay === 'Define') {
            r = r.map(d => {
              if (d.valueName === 'Complication') {
                return {
                  ...d,
                  content: `${
                    r.find(d => d.valueName === 'Complication Define')
                      ?.content || ''
                  }`,
                }
              }

              return d
            })
          }

          r = r.filter(d => d.valueName !== 'Complication Define')

          r = r.map(d => {
            if (d.valueName === 'Transfusion') {
              let content = d.content
              let displayStyle = 'col'

              if (content.length > 27) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Post procedure instructions') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 18) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            } else if (d.valueName === 'Entries uterus') {
              return {
                ...d,
                display: 'No. of uterine entry',
              }
            } else if (d.valueName === 'Sampling Site') {
              let content = d.content
              let displayStyle = 'col'
              if (content.length > 25) displayStyle = 'row'

              return {
                ...d,
                displayStyle,
              }
            }

            return d
          })
        }
      }
    }

    // console.log('final', r)
  }

  if (templateId === TEMPLATES['fetalEcho'].id) {
    let abnName = ['Present', 'VSD', 'ASD', 'Discordance', 'Abnormal']
    // console.log(r)
    r = r.map(r => {
      if (
        r.valueName === 'Cardiac Function' ||
        abnName.includes(r.contentOptionDisplay)
      ) {
        return { ...r, displayStyle: 'row' }
      }

      return r
    })
  }

  if (templateId === TEMPLATES['uterus'].id) {
    // console.log({ ...r })
    const findFreetext = r.filter(r => r.valueName === 'Freetext')
    if (findFreetext.length > 0) {
      r = r.filter(r => r.valueName !== 'Freetext' && r.valueName !== 'Uterus')
      r.splice(0, 0, {
        ...findFreetext[0],
        valueName: 'Uterus',
        display: 'Uterus',
      })
    }

    const findMyometriumAbnormal = r.filter(r =>
      [495, 496, 497].includes(r.valueId)
    )

    if (findMyometriumAbnormal.length > 0) {
      // console.log('has Myo abnormal')
      let index = r.findIndex(e => {
        if (e.valueId === 494) return e.valueId === 494
      })

      r = r.filter(r => ![494, 495, 496, 497].includes(r.valueId))
      // console.log(findMyometriumAbnormal)
      r.splice(index, 0, {
        content: findMyometriumAbnormal
          .filter(f => f.content !== '-')
          .map(abs => {
            let test = abs.content?.split('-')

            return test?.join(': ')
          })
          .join(', '),
        valueName: 'Myometrium Abnormal',
        display: 'Myometrium Abnormal',
        displayStyle: 'row',
        // color: 'red',
        type: 'A',
      })

      // if has Myoma > check fibroids
      const hasMyoma = findMyometriumAbnormal.filter(r => r.valueId === 496)
      if (hasMyoma.length > 0) {
        // console.log('has fibroids', data[TEMPLATES['fibroids'].id])

        const fibroidsData = data[TEMPLATES['fibroids'].id].map(d =>
          d.content.split('-')
        )
        // console.log(fibroidsData)
        if (fibroidsData.length > 0) {
          // console.log('has fibroids')
          r.splice(index + 1, 0, {
            content: '',
            valueName: 'Fibroids',
            display: 'Fibroids',
            displayStyle: 'row',
            type: 'T',
            isFibroids: true,
            fibroidsData,
          })
        }
      }
    }

    const findCervixAbnormal = r.filter(r => r.valueId === 499)

    if (findCervixAbnormal.length > 0) {
      // console.log('has Cervix abnormal')
      let index = r.findIndex(e => {
        if (e.valueId === 498) return e.valueId === 498
      })

      r = r.filter(r => ![498, 499].includes(r.valueId))
      r.splice(index, 0, {
        content: findCervixAbnormal[0].content,
        valueName: 'Cervix Abnormal',
        display: 'Cervix Abnormal',
        displayStyle: 'row',
        // color: 'red',
        type: 'A',
      })
    }
  }

  if (templateId === TEMPLATES['ovaries'].id) {
    // console.log('has ovaries')
    const findRightOvaryAbnormal = r.filter(r => r.valueId === 510)
    if (findRightOvaryAbnormal.length > 0) {
      let index = r.findIndex(e => {
        if (e.valueId === 509) return e.valueId === 509
      })

      r = r.filter(r => ![509, 510].includes(r.valueId))

      r.splice(index, 0, {
        content: findRightOvaryAbnormal[0].content,
        valueName: 'Morphology Abnormal (Right)',
        display: 'Morphology Abnormal (Right)',
        displayStyle: 'row',
        // color: 'red',
        type: 'A',
      })
    }

    const findLeftOvaryAbnormal = r.filter(r => r.valueId === 506)
    if (findLeftOvaryAbnormal.length > 0) {
      let index = r.findIndex(e => {
        if (e.valueId === 505) return e.valueId === 505
      })

      r = r.filter(r => ![505, 506].includes(r.valueId))
      r.splice(index, 0, {
        content: findLeftOvaryAbnormal[0].content,
        valueName: 'Morphology Abnormal (Left)',
        display: 'Morphology Abnormal (Left)',
        displayStyle: 'row',
        // color: 'red',
        type: 'A',
      })
    }
  }

  if (templateId === TEMPLATES['follicleScreen'].id) {
    let leftFollicle = r.filter(f => f.valueId > 534 && f.valueId < 545)
    let rightFollicle = r.filter(f => f.valueId > 544)
    let comments = r
      .filter(f => [533, 534].includes(f.valueId))
      .map(m => {
        return {
          ...m,
          content: '\n' + m.content,
        }
      })

    r = r
      .filter(f => f.valueId < 533)
      .map(m => {
        if ([529, 530].includes(m.valueId)) {
          return {
            ...m,
            content: convertDateTimeFormat(m.content, 'D MMM YYYY'),
          }
        }
        return m
      })

    let follicleData = []
    for (let i = 535; i < 545; i++) {
      let left = leftFollicle
        .find(f => f.valueId === i)
        ?.content?.split('-') || ['', '', '', '']
      let right = rightFollicle
        .find(f => f.valueId === i + 10)
        ?.content?.split('-') || ['', '', '', '']
      follicleData.push([...left, ...right])
    }

    follicleData = follicleData.filter(f => f.some(f => f !== ''))

    if (follicleData.length > 0) {
      r.push({
        content: '',
        valueName: '',
        display: '',
        displayStyle: 'row',
        type: 'T',
        isFollicle: true,
        follicleData,
      })
    }

    r = [...r, ...comments]
    // console.log(r)
  }

  if (templateId === TEMPLATES['abnormalMass'].id) {
    let hasCystContent = r.filter(f => f.valueId >= 515 && f.valueId <= 520)
    // console.log(hasCystContent)
    if (hasCystContent.length > 0) {
      // console.log('has cyst content')
      // let index = r.findIndex(e => {
      //   if (e.valueId === 514) return e.valueId === 514
      // })
      r = r.filter(f => ![514].includes(f.valueId))
      r = r.map(r => {
        if ([519, 520].includes(r.valueId)) {
          return { ...r, type: 'T', content: '', showColon: 'no' }
        }
        return r
      })
    }

    let hasSolidContent = r.filter(f => [521, 522].includes(f.valueId))
    if (hasSolidContent.length > 0) {
      let contentOption = r.find(r => r.valueId === 514)?.contentOption
      let index = r.findIndex(e => {
        if (e.valueId === 514) return e.valueId === 514
      })

      r = r.filter(f => ![514, 521, 522].includes(f.valueId))
      r.splice(index, 0, {
        content: hasSolidContent.map(s => s.content).join(', '),
        valueName: contentOption === 503 ? 'Solid' : 'Solid & Cyst',
        display: contentOption === 503 ? 'Solid' : 'Solid & Cyst',
        displayStyle: 'col',
        type: 'T',
      })
    }
  }
  return r
}

export function findingsTemplate2pdfmake(data = [], tname, fetus = 1) {
  const borderColor = ['#ccc', '#ccc', '#ccc', '#ccc']
  let title = [
    {
      text: [
        {
          text: TEMPLATES[tname].display,
          style: 'defaultFont',
          bold: true,
        },
      ],
      marginLeft: 1,
      marginBottom: fetus === 1 ? 1 : 2,
    },
  ]
  let rows = []
  let row = []
  let temp = []
  let isEmptyDataAllFetus = true

  for (let f = 1; f <= fetus; f++) {
    let r = data[f][TEMPLATES[tname].id] || []

    r = modifyReport(r, TEMPLATES[tname].id, data[f])

    if (fetus > 1) {
      row.push([
        {
          marginLeft: 8,
          columns: [
            {
              width: '*',
              text: [
                {
                  text: r.length > 0 ? `Fetus ${FETUS_NAME[f]}` : '',
                  style: 'defaultSmallerFont',
                  bold: true,
                },
              ],
            },
          ],
        },
      ])
    }

    let countColumn = 0
    r.forEach((data, i) => {
      isEmptyDataAllFetus = false

      let display = data.display?.trim() || data.valueName || ''
      if (display === 'Comments') {
        display = 'Comment'
      }

      if (data.showColon !== 'no') display += ': '
      let content = data.content || data.contentOptionDisplay
      if (['A', 'T'].includes(data.type))
        content = content?.replace(/<br\s*[/]?>/gi, '\n') || ''

      let unit = data.unit

      if (data.displayStyle === 'row') {
        let alignment = { alignment: 'right' }
        let margin = { marginRight: 0 }
        if (data.isFibroids) {
          row.push([
            {
              text: [
                {
                  text: `Fibroids: `,
                  bold: true,
                },
              ],
              marginTop: 1,
              marginBottom: 1,
              marginLeft: fetus === 1 ? 10 : 15,
            },
          ])

          // console.log(data.fibroidsData)
          const fibroids = data.fibroidsData.map((fibroids, i) => [
            {
              text: i + 1,
              alignment: 'center',
              borderColor,
            },
            {
              ...alignment,
              ...margin,
              text: fibroids[0],
              borderColor,
            },
            { ...alignment, ...margin, text: fibroids[1], borderColor },
            { ...alignment, ...margin, text: fibroids[2], borderColor },
            { ...alignment, ...margin, text: fibroids[3], borderColor },
            { text: fibroids[4], borderColor },
            { text: fibroids[5], borderColor },
            { text: fibroids[6], borderColor },
          ])

          row.push([
            {
              // layout: 'noBorders', // optional
              // layout: 'lightHorizontalLines', // optional
              table: {
                widths: [14, 34, 34, 34, 34, 100, 120, '*'],
                body: [
                  [
                    {
                      text: 'No',
                      // border: [false, true, false, false],
                      // fillColor: '#eeeeee',
                      bold: true,
                      borderColor,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D1(cm)',
                      bold: true,
                      borderColor,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D2(cm)',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D3(cm)',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'Vol(ml)',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'Type',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'Position',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    { text: '', borderColor },
                  ],
                  ...fibroids,
                ],
              },
              style: 'defaultSmallestFont',
              // fillColor: 'red',
              // border: [false, false, false, false],
              marginBottom: 8,
              marginLeft: fetus === 1 ? 10 : 15,
            },
          ])
          // row.push([
          //   {
          //     canvas: [
          //       {
          //         type: 'line',
          //         lineWidth: 0.5,
          //         x1: 0,
          //         x2: 525,
          //         y1: 0,
          //         y2: 0,
          //         lineColor: '#ccc',
          //       },
          //     ],
          //     margin: [0, -5, 0, 0],
          //     colSpan: 2,
          //   },
          // ])
        } else if (data.isFollicle) {
          const follicle = data.follicleData.map((follicle, i) => [
            {
              text: i + 1,
              alignment: 'center',
              borderColor,
            },
            {
              ...alignment,
              ...margin,
              text: follicle[0],
              borderColor,
            },
            { ...alignment, ...margin, text: follicle[1], borderColor },
            { ...alignment, ...margin, text: follicle[2], borderColor },
            { ...alignment, ...margin, text: follicle[3], borderColor },
            {
              text: i + 1,
              alignment: 'center',
              borderColor,
            },
            { ...alignment, ...margin, text: follicle[4], borderColor },
            { ...alignment, ...margin, text: follicle[5], borderColor },
            { ...alignment, ...margin, text: follicle[6], borderColor },
            { ...alignment, ...margin, text: follicle[7], borderColor },
          ])

          row.push([
            {
              // layout: 'noBorders', // optional
              // layout: 'lightHorizontalLines', // optional
              table: {
                widths: [30, 45, 45, 45, 50, 30, 45, 45, 45, 50],
                body: [
                  [
                    {
                      text: 'Left',
                      bold: true,
                      border: [true, true, false, false],
                      borderColor,
                      style: 'defaultSmallerFont',
                    },
                    {
                      text: '',
                      border: [false, true, false, false],
                      borderColor,
                    },
                    {
                      text: '',
                      border: [false, true, false, false],
                      borderColor,
                    },
                    {
                      text: '',
                      border: [false, true, false, false],
                      borderColor,
                    },
                    {
                      text: '',
                      border: [false, true, true, false],
                      borderColor,
                    },
                    {
                      text: 'Right',
                      bold: true,
                      border: [false, true, false, false],
                      borderColor,
                      style: 'defaultSmallerFont',
                    },
                    {
                      text: '',
                      border: [false, true, false, false],
                      borderColor,
                    },
                    {
                      text: '',
                      border: [false, true, false, false],
                      borderColor,
                    },
                    {
                      text: '',
                      border: [false, true, false, false],
                      borderColor,
                    },
                    {
                      text: '',
                      border: [false, true, true, false],
                      borderColor,
                    },
                  ],
                  [
                    {
                      text: 'Follicle',
                      // alignment: 'center',
                      bold: true,
                      borderColor,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D1(mm)',
                      alignment: 'center',
                      bold: true,
                      borderColor,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D2(mm)',
                      alignment: 'center',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D3(mm)',
                      alignment: 'center',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'Mean',
                      alignment: 'center',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'Follicle',
                      bold: true,
                      borderColor,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D1(mm)',
                      alignment: 'center',
                      bold: true,
                      borderColor,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D2(mm)',
                      alignment: 'center',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'D3(mm)',
                      alignment: 'center',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                    {
                      text: 'Mean',
                      alignment: 'center',
                      borderColor,
                      bold: true,
                      style: 'defaultSmallFontHeader',
                    },
                  ],
                  ...follicle,
                ],
              },
              style: 'defaultSmallestFont',
              // fillColor: 'red',
              // border: [false, false, false, false],
              // marginTop: -3,
              marginBottom: 3,
              marginLeft: fetus === 1 ? 10 : 15,
            },
          ])
        } else {
          // console.log('push row', display, content, countColumn)
          row.push([
            {
              marginLeft: fetus === 1 ? 10 : 15,
              columns: [
                {
                  width: '*',
                  // decoration: data?.underline ? 'underline' : undefined,
                  text: [
                    {
                      text: `${display} `,
                      bold: true,
                      style: 'defaultSmallFont',
                      color: data?.color || undefined,
                    },
                    {
                      text: content,
                      style: 'defaultFont',
                      decoration: data?.underline ? 'underline' : undefined,
                    },
                  ],
                },
              ],
            },
          ])
        }

        countColumn = 0
        // console.log('push row', display, content)
      } else {
        countColumn += 1
        // console.log('push col', display, content, countColumn)

        temp.push({
          width: countColumn === 1 ? 250 : '*',
          text: [
            {
              text: `${display} `,
              style: 'defaultSmallFont',
              bold: true,
              color: data?.color || undefined,
            },
            {
              text: content + ' ' + (unit && unit != null ? unit : ''),
              style: 'defaultFont',
            },
          ],
        })

        if (countColumn === 2) {
          // console.log(temp)
          countColumn = 0
          row.push([
            {
              marginLeft: fetus === 1 ? 10 : 15,
              columns: temp,
            },
          ])
          temp = []
        }

        if (
          countColumn === 1 &&
          (r[i + 1]?.displayStyle === 'row' || r.length === i + 1)
        ) {
          // console.log('push col last item')

          row.push([
            {
              marginLeft: fetus === 1 ? 10 : 15,
              columns: temp,
            },
          ])

          temp = []
        }
      }
    })

    rows.push(row)
  }

  if (isEmptyDataAllFetus) title = []

  return [...title, ...rows]
}

export function fillOBmesurements(patient) {
  if (patient.obStudyType === '1') {
    return [
      {
        text: [
          {
            text: 'OB Measurement ',
            style: 'defaultSmallerFont',
            bold: true,
          },
        ],
        marginLeft: 1,
        marginTop: -2,
      },
      {
        layout: 'noBorders',
        style: 'tablePatientInfo',
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: `US-GA: ${patient.usGa || ''}`,
                style: 'defaultSmallerFont',
              },
              {
                text: `LMP-GA: ${patient.lmpGa || ''} `,
                style: 'defaultSmallerFont',
              },
              {
                text: `EDC-GA: ${patient.edcGa || ''}`,
                style: 'defaultSmallerFont',
              },
            ],
          ],
        },
        marginLeft: 7,
        marginTop: -1,
      },
      {
        layout: 'noBorders',
        style: 'tablePatientInfo',
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: `US-EDC: ${convertDateTimeFormat(
                  patient.usEdc,
                  'D MMM YYYY'
                )}`,
                style: 'defaultSmallerFont',
              },
              {
                text: `LMP-EDC: ${convertDateTimeFormat(
                  patient.lmpEdc,
                  'D MMM YYYY'
                )} `,
                style: 'defaultSmallerFont',
              },
              {
                text: `EDC: ${convertDateTimeFormat(
                  patient.edc,
                  'D MMM YYYY'
                )}`,
                style: 'defaultSmallerFont',
              },
            ],
          ],
        },
        marginLeft: 7,
        marginTop: -5,
      },
      {
        layout: 'noBorders',
        style: 'tablePatientInfo',
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: `Number of Fetus: ${patient.noFetus}`,
                style: 'defaultSmallerFont',
              },
              {
                text: `Method: ${patient.method} `,
                style: 'defaultSmallerFont',
              },
              {
                text: ``,
              },
            ],
          ],
        },
        marginLeft: 7,
        marginTop: -5,
      },
      {
        text: [
          {
            text: 'Indication: ',
            style: 'defaultSmallFont',
            bold: true,
          },
          {
            text: combineIndications(patient),
            style: 'defaultFont',
          },
        ],
        marginLeft: 1,
        marginTop: -2,
        marginBottom: 2,
      },
    ]
  }

  return [
    {
      text: [
        {
          text: 'Gynaecology Report',
          style: 'defaultSmallFont',
          bold: true,
        },
      ],
      marginLeft: 1,
      marginTop: -3,
    },
    {
      text: 'Method: ' + patient.method,
      style: 'defaultSmallFont',
      marginLeft: 1,
      marginTop: 1,
    },
    {
      text: [
        {
          text: 'Indication: ',
          style: 'defaultSmallFont',
          bold: true,
        },
        {
          text: combineIndications(patient),
          style: 'defaultSmallFont',
        },
      ],
      marginLeft: 1,
      marginTop: -2,
      marginBottom: 1,
    },
  ]
}

export function fill2DMesurement(report, fetus, stype = 1) {
  // console.log(report)
  PATIENT_INFO = report.patientInfo
  const borderColor = ['#b7b7b7', '#b7b7b7', '#b7b7b7', '#b7b7b7']
  let totalFetus = parseInt(fetus)
  let twoD = []
  let doppler = []

  let tableWidth = [230, 285]
  let tableBody = [
    {
      text: '2D Mesurements',
      bold: true,
      style: 'defaultSmallerFont',
      borderColor,
    },
    {
      text: 'Doppler Mesurements ',
      bold: true,
      style: 'defaultSmallerFont',
      borderColor,
    },
  ]

  if (stype === '1') {
    // for 2D
    for (let f = 1; f <= totalFetus; f++) {
      let t = report.reportTemplate[f][TEMPLATES.obMeasurement.id]?.map(d => {
        if (!d.content) return

        let valueName = d.valueName
        let content = d.content
        let ga = ''
        let unit = d.unit

        if (content.indexOf('#') !== -1) {
          let c = content.split('#')
          content = c[0]
          ga = `GA ${c[1]}`
        }
        if (d.type === 'F') {
          valueName = d.freeName
          unit = d.freeUnit
        }
        return [
          {
            columns: [
              { text: valueName },
              {
                text: ` ${content} ${unit}`,
                // alignment: 'right',
                // marginRight: 20,
                marginLeft: 5,
              },
              { text: ga, marginLeft: 5 },
            ],
          },
          {
            canvas: [
              {
                type: 'line',
                lineWidth: 0.5,
                x1: 0,
                x2: 229,
                y1: 0,
                y2: 0,
                lineColor: '#ccc',
              },
            ],
            margin: [-8, 0, 0, 1],
          },
        ]
      })
      if (t?.length > 0) {
        if (totalFetus > 1)
          twoD.push({
            columns: [
              { text: `Fetus ${FETUS_NAME[f]}`, bold: true, marginLeft: -8 },
            ],
          })
        twoD.push(t)
      }

      if (twoD.length !== 0 && totalFetus !== f) {
        twoD.push({
          canvas: [
            {
              type: 'line',
              lineWidth: 0.5,
              x1: 0,
              x2: 234,
              y1: 0,
              y2: 0,
              lineColor: '#ccc',
            },
          ],
          margin: [-10, 2, 0, 2],
        })
      }
    }

    let checkHasDoppler = false
    let checkDopplerHeader = false

    // for doppler
    for (let f = 1; f <= totalFetus; f++) {
      if (totalFetus > 1) {
        // console.log(report.reportTemplate[f][TEMPLATES.obDoppler.id])
        if (report.reportTemplate[f][TEMPLATES.obDoppler.id]?.length > 0)
          doppler.push({
            columns: [
              { text: `Fetus ${FETUS_NAME[f]}`, bold: true, marginLeft: 0 },
            ],
          })
      }

      doppler.push([
        {
          columns: [
            '',
            {
              text: 'Vmax',
              alignment: 'center',
            },
            {
              text: 'PI',
              alignment: 'center',
            },
            {
              text: 'RI',
              alignment: 'center',
            },
            {
              text: 'S/D',
              alignment: 'center',
            },
            {
              text: 'EDF',
              alignment: 'center',
            },
          ],
        },
        {
          canvas: [
            {
              type: 'line',
              lineWidth: 0.5,
              x1: 0,
              x2: 285,
              y1: 0,
              y2: 0,
              lineColor: '#ccc',
            },
          ],
          margin: [0, 0, 0, 1],
        },
      ])

      const dId = [
        [35, 36, 37, 38, 39],
        [40, 41, 42, 43, 44],
        [45, 46, 47, 48, 49],
        [50, 51, 52, 53, 54],
        [55, 56, 57, 58, 59],
      ]
      // checkHasDoppler = false
      for (let i = 0; i < dId.length; i++) {
        let id = dId[i]
        let data =
          report.reportTemplate[f][TEMPLATES.obDoppler.id]?.filter(f =>
            id.includes(f.valueId)
          ) || []
        if (data.length > 0) {
          let t = {
            columns: getDopplerValue(data, id),
          }

          checkHasDoppler = true
          checkDopplerHeader = true
          doppler.push([
            t,
            {
              canvas: [
                {
                  type: 'line',
                  lineWidth: 0.5,
                  x1: 0,
                  x2: 285,
                  y1: 0,
                  y2: 0,
                  lineColor: '#ccc',
                },
              ],
              margin: [0, 0, 0, 1],
            },
          ])
        }
      }

      if (!checkDopplerHeader) {
        doppler.pop()
      }

      checkDopplerHeader = false

      const DuctusId = [60, 61, 62, 63, 64]
      let data =
        report.reportTemplate[f][TEMPLATES.obDoppler.id]?.filter(f =>
          DuctusId.includes(f.valueId)
        ) || []

      if (data.length > 0) {
        doppler.push({
          columns: [
            {
              text: 'Ductus Venosus',
              marginTop: 3,
              marginLeft: 8,
              bold: true,
            },
          ],
        })
      }

      for (let i = 0; i < data.length; i++) {
        let newArray = [
          {
            text: data[i].valueName,
            marginLeft: 12,
          },
          {
            text: data[i].content + ' ' + data[i].unit,
            marginLeft: 8,
          },
          '',
        ]

        let t = {
          columns: newArray,
        }

        if (data.length > 0) {
          checkHasDoppler = true
          doppler.push([
            t,
            {
              canvas: [
                {
                  type: 'line',
                  lineWidth: 0.5,
                  x1: 0,
                  x2: 285,
                  y1: 0,
                  y2: 0,
                  lineColor: '#ccc',
                },
              ],
              margin: [0, 0, 0, 1],
            },
          ])
        }
      }

      const UmbilicalId = [67, 68]
      data =
        report.reportTemplate[f][TEMPLATES.obDoppler.id]?.filter(f =>
          UmbilicalId.includes(f.valueId)
        ) || []

      if (data.length > 0) {
        doppler.push({
          columns: [
            {
              text: 'Umbilical Vein',
              marginTop: 3,
              marginLeft: 8,
              bold: true,
            },
          ],
        })
      }

      for (let i = 0; i < data.length; i++) {
        let newArray = [
          {
            text: data[i].valueName,
            marginLeft: 12,
          },
          {
            text: data[i].content + ' ' + data[i].unit,
            marginLeft: 8,
          },
          '',
        ]

        let t = {
          columns: newArray,
        }

        if (data.length > 0) {
          checkHasDoppler = true
          doppler.push([
            t,
            {
              canvas: [
                {
                  type: 'line',
                  lineWidth: 0.5,
                  x1: 0,
                  x2: 285,
                  y1: 0,
                  y2: 0,
                  lineColor: '#ccc',
                },
              ],
              margin: [0, 0, 0, 1],
            },
          ])
        }
      }

      if (checkHasDoppler && totalFetus !== f) {
        doppler.push({
          canvas: [
            {
              type: 'line',
              lineWidth: 0.5,
              x1: 0,
              x2: 287,
              y1: 0,
              y2: 0,
              lineColor: '#ccc',
            },
          ],
          margin: [-1, 2, 0, 2],
        })
      }
    }

    let tableRow = [
      {
        stack: twoD,
        marginLeft: 8,
        borderColor,
        style: 'defaultSmallerFont',
      },
      {
        stack: doppler,
        borderColor,
        style: 'defaultSmallerFont',
      },
    ]

    if (twoD.length === 0) {
      tableBody = [
        {
          text: 'Doppler Mesurements ',
          bold: true,
          style: 'defaultSmallerFont',
          borderColor,
        },
      ]
      tableRow = [
        {
          stack: doppler,
          borderColor,
          style: 'defaultSmallerFont',
        },
      ]
      tableWidth = [285]
    }

    if (!checkHasDoppler) {
      tableBody = [
        {
          text: '2D Mesurements ',
          bold: true,
          style: 'defaultSmallerFont',
          borderColor,
        },
      ]

      tableRow = [
        {
          stack: twoD,
          marginLeft: 8,
          borderColor,
          style: 'defaultSmallerFont',
        },
      ]
      tableWidth = [230]
    }

    let twoDmes = [
      {
        table: {
          widths: tableWidth,
          body: [tableBody, tableRow],
        },
        marginTop: 0,
        marginBottom: 6,
      },
    ]

    if (twoD.length === 0 && !checkHasDoppler) twoDmes = []

    return twoDmes
  }

  tableWidth = [210, 305]
  let checkHasTwoD = false
  let checkTwoDHeader = false
  let f = 1
  twoD.push([
    {
      columns: [
        {
          text: '',
          width: 42,
        },
        {
          text: 'Length',
          alignment: 'center',
        },
        {
          text: 'AP',
          alignment: 'center',
        },
        {
          text: 'Width',
          alignment: 'center',
        },
        {
          text: 'Volumn',
          alignment: 'center',
        },
      ],
    },
    {
      canvas: [
        {
          type: 'line',
          lineWidth: 0.5,
          x1: 0,
          x2: 210,
          y1: 0,
          y2: 0,
          lineColor: '#ccc',
        },
      ],
      margin: [-8, 0, 0, 1],
    },
  ])
  // twoD.push(line2D)

  let dId = [
    [555, 556, 557, 558],
    [559, 560, 561, 562],
    [564, 565, 566, 567],
    [568, 569, 570, 571],
    [572, 573, 574, 575],
    [576, 577, 578, 579],
    [580, 581, 582, 583],
    [584, 585, 586, 587],
    [588, 589, 590, 591],
  ]
  // checkHasTwoD = false
  // console.log(report.reportTemplate[f][TEMPLATES.gynMeasurement.id])
  for (let i = 0; i < dId.length; i++) {
    let id = dId[i]

    let data = report.reportTemplate[f][TEMPLATES.gynMeasurement.id].filter(f =>
      id.includes(f.valueId)
    )
    // console.log('data', data)
    if (data.length > 0) {
      let t = {
        columns: getDopplerValue(data, id, 42, -5),
      }

      checkHasTwoD = true
      checkTwoDHeader = true
      twoD.push([
        t,
        {
          canvas: [
            {
              type: 'line',
              lineWidth: 0.5,
              x1: 0,
              x2: 210,
              y1: 0,
              y2: 0,
              lineColor: '#ccc',
            },
          ],
          margin: [-8, 0, 0, 1],
        },
      ])
    }
  }

  if (!checkTwoDHeader) {
    twoD.pop()
  }

  const wallTickAndEndometrial = [592, 593]
  let data = report.reportTemplate[f][TEMPLATES.gynMeasurement.id].filter(f =>
    wallTickAndEndometrial.includes(f.valueId)
  )
  // console.log(data)
  // if (data.length > 0) {
  //   twoD.push({
  //     canvas: [
  //       {
  //         type: 'line',
  //         lineWidth: 0.5,
  //         x1: 0,
  //         x2: 210,
  //         y1: 0,
  //         y2: 0,
  //         lineColor: '#ccc',
  //       },
  //     ],
  //     margin: [-8, 0, 0, 1],
  //   })
  // }

  for (let i = 0; i < data.length; i++) {
    // console.log(data[i])
    let newArray = [
      {
        text: capitalizeSentence(data[i].valueName),
        width: data[i].valueId === 592 ? 80 : 115,
        marginLeft: -5,
      },
      {
        text: data[i].content + ' ' + data[i].unit,
      },
    ]

    let t = {
      columns: newArray,
    }

    if (data.length > 0) {
      checkHasTwoD = true
      twoD.push([
        t,
        {
          canvas: [
            {
              type: 'line',
              lineWidth: 0.5,
              x1: 0,
              x2: 210,
              y1: 0,
              y2: 0,
              lineColor: '#ccc',
            },
          ],
          margin: [-8, 0, 0, 1],
        },
      ])
    }
  }

  let checkHasDoppler = false
  let checkDopplerHeader = false

  doppler.push([
    {
      columns: [
        {
          text: '',
          width: 62,
        },
        {
          text: 'PSV',
          alignment: 'center',
        },
        {
          text: 'EDV',
          alignment: 'center',
        },
        {
          text: 'MnV',
          alignment: 'center',
        },
        {
          text: 'PI',
          alignment: 'center',
        },
        {
          text: 'RI',
          alignment: 'center',
        },
        {
          text: 'S/D',
          alignment: 'center',
        },
      ],
    },
    {
      canvas: [
        {
          type: 'line',
          lineWidth: 0.5,
          x1: 0,
          x2: 306,
          y1: 0,
          y2: 0,
          lineColor: '#ccc',
        },
      ],
      margin: [0, 0, 0, 2],
    },
  ])

  dId = [
    [594, 595, 596, 597, 598, 599],
    [600, 601, 602, 603, 604, 605],
    [606, 607, 608, 609, 610, 611],
    [612, 613, 614, 615, 616, 617],
    [618, 619, 620, 621, 622, 623],
    [624, 625, 626, 627, 628, 629],
  ]

  for (let i = 0; i < dId.length; i++) {
    let id = dId[i]

    let data =
      report.reportTemplate[f][TEMPLATES.gynDoppler.id]?.filter(f =>
        id.includes(f.valueId)
      ) || []
    // console.log('data', data)
    if (data?.length > 0) {
      let t = [
        {
          columns: getDopplerValue(data, id, 62, 2),
        },
        {
          canvas: [
            {
              type: 'line',
              lineWidth: 0.5,
              x1: 0,
              x2: 306,
              y1: 0,
              y2: 0,
              lineColor: '#ccc',
            },
          ],
          margin: [0, 0, 0, 2],
        },
      ]

      checkHasDoppler = true
      checkDopplerHeader = true
      doppler.push(t)
      // doppler.push(line2D)
    }
  }

  if (!checkDopplerHeader) {
    doppler.pop()
  }

  let tableRow = [
    {
      stack: twoD,
      marginLeft: 8,
      borderColor,
      style: 'defaultSmallerFont',
    },
    {
      stack: doppler,
      borderColor,
      style: 'defaultSmallerFont',
    },
  ]

  if (!checkHasTwoD) {
    tableBody = [
      {
        text: 'Doppler Mesurements ',
        bold: true,
        style: 'defaultSmallerFont',
        borderColor,
      },
    ]
    tableRow = [
      {
        stack: doppler,
        borderColor,
        style: 'defaultSmallerFont',
      },
    ]
    tableWidth = [305]
  }

  if (!checkHasDoppler) {
    tableBody = [
      {
        text: '2D Mesurements ',
        bold: true,
        style: 'defaultSmallerFont',
        borderColor,
      },
    ]

    tableRow = [
      {
        stack: twoD,
        marginLeft: 8,
        borderColor,
        style: 'defaultSmallerFont',
      },
    ]
    tableWidth = [210]
  }

  let twoDmes = [
    {
      table: {
        widths: tableWidth,
        body: [tableBody, tableRow],
      },
      marginTop: 0,
      marginBottom: 6,
    },
  ]

  if (!checkHasTwoD && !checkHasDoppler) twoDmes = []
  // Gynaecology
  return twoDmes
}

function getDopplerValue(
  data,
  id = [],
  firstColWidth = undefined,
  marginLeft = 8
) {
  // console.log(data)
  let newArray = [
    {
      text: data[0].valueName,
      marginLeft,
      width: firstColWidth,
    },
  ]

  id.forEach(i => {
    let c = data.find(d => d.valueId === i)
    let m = c

    if (c) {
      c = c.content || c.contentOptionDisplay || ''
      if (c === 'Reverse Flow') c = c.replace('Reverse Flow', 'Reverse')
    }

    if (['Lt.MCA-Vmax', 'Rt.MCA-Vmax', 'UmA-PI'].includes(m?.display)) {
      if (m.display === 'UmA-PI') {
        let p95Col = undefined
        let umaPi95 = computeUaPi95(c, PATIENT_INFO)

        if (umaPi95) {
          p95Col = {
            text: `95P=${umaPi95}`,
            // color: 'red',
            listType: 'none',
            marginTop: -5,
            fontSize: 8,
            // alignment: 'left',
            // marginLeft: 7,
          }
        }

        newArray.push({
          ul: [
            { text: c, color: umaPi95 ? 'red' : undefined, listType: 'none' },
            p95Col,
          ],
          listType: 'none',
          alignment: 'center',
          marginLeft: -12,
        })
      } else if (['Lt.MCA-Vmax', 'Rt.MCA-Vmax'].includes(m?.display)) {
        let momCol = undefined
        if (PATIENT_INFO.edcGa || PATIENT_INFO.usGa) {
          let key = m.display === 'Lt.MCA-Vmax' ? 'Lt.MCA' : 'Rt.MCA'
          // console.log(PATIENT_INFO.edcGa)
          // console.log(m)

          let mom = computeMOM(
            [
              {
                ...m,
                contentValueName: key,
              },
            ],
            PATIENT_INFO
          )

          if (mom[key]) {
            momCol = {
              text: mom[key],
              listType: 'none',
              marginTop: -5,
              fontSize: 8,
              // alignment: 'left',
              // marginLeft: 7,
            }
          }
        }

        newArray.push({
          ul: [{ text: c, listType: 'none' }, momCol],
          listType: 'none',
          alignment: 'center',
          marginLeft: -10,
        })
      }
    } else {
      newArray.push({
        text: c,
        alignment: 'center',
      })
    }
  })

  return newArray
}

function attachImages(imagesSelected, sysProps, type) {
  try {
    let columnStyle = '2'
    let imgSources = {}
    let imgColumn = []

    let images = imagesSelected

    if (type === 'worklist') {
      if (images?.length > 0) {
        columnStyle = images[0]?.cols || '2'
      }
    }

    let imgUrl = `${sysProps.serverProperties.HOST}:${sysProps.serverProperties.SERVER_PORT}`
    if (sysProps.sampleImage === 'YES') {
      const url = window.location.href
      let arr = url.split('/')
      let result = arr[0] + '//' + arr[2]
      // console.log(result)
      imgUrl = result
    }

    images.forEach((img, i) => {
      if (i === 0) columnStyle = img?.cols || '2'

      imgSources[`s${i}`] = `${imgUrl}${img.src}`
      // ] = `${sysProps.serverProperties.HOST}:${sysProps.serverProperties.SERVER_PORT}${img.src}`

      if (columnStyle === '2') {
        imgColumn[i] = [
          { image: `s${i}`, fit: [264, 198] },
          { text: '', width: 4 },
        ]
      } else {
        imgColumn[i] = [{ image: `s${i}`, width: 400 }]
      }
    })

    let wImages = []

    if (columnStyle === '2') {
      images.forEach((img, i) => {
        if (i % 2 === 0) {
          let secondCol = []
          if (imgColumn[i + 1]) {
            secondCol = imgColumn[i + 1]
          }
          wImages[i] = {
            columns: [...imgColumn[i], ...secondCol],
            marginTop: i <= 1 ? 10 : 5,
          }
        }
      })
    } else {
      images.forEach((img, i) => {
        wImages[i] = {
          columns: imgColumn[i],
          marginTop: i === 0 ? 10 : 5,
        }
      })
    }

    return [wImages, imgSources]
  } catch (error) {
    console.log(error)
  }
}

function attachEfw(efwData, sysProps) {
  try {
    let efwSource = {}
    let efwImage = []

    let imgUrl = `${sysProps.serverProperties.HOST}:${sysProps.serverProperties.SERVER_PORT}`
    if (sysProps.sampleImage === 'YES') {
      const url = window.location.href
      let arr = url.split('/')
      let result = arr[0] + '//' + arr[2]
      imgUrl = result
    }

    if (!isEmpty(efwData)) {
      Object.keys(efwData).forEach(key => {
        if (efwData[key]) {
          efwSource[key] = `${imgUrl}${efwData[key]}`
          efwImage.push({
            // columns: [{ image: key, fit: [530, 392] }],
            columns: [{ image: key, width: 530 }],
            marginTop: 5,
            marginLeft: -1,
          })
        }
      })
    }

    return [efwImage, efwSource]
  } catch (error) {
    console.log(error)
  }
}

export function storeBackupData(data) {
  window.localStorage.setItem(
    STORAGE_NAME.lastActiveTabData,
    JSON.stringify(data)
  )
}

export function storeBackupData2(data) {
  window.localStorage.setItem(
    STORAGE_NAME.lastActiveTabData2,
    JSON.stringify(data)
  )
}

export function storeBackupData3(data, pname) {
  if (!pname) {
    return window.localStorage.setItem(
      STORAGE_NAME.lastActiveTabData3,
      JSON.stringify(data)
    )
  }

  switch (pname) {
    case 'Amniocentesis':
      window.localStorage.setItem(
        STORAGE_NAME.Amniocentesis,
        JSON.stringify(data)
      )
      break
    case 'CVS':
      window.localStorage.setItem(STORAGE_NAME.CVS, JSON.stringify(data))
      break
    case 'Cordocentesis':
      window.localStorage.setItem(
        STORAGE_NAME.Cordocentesis,
        JSON.stringify(data)
      )
      break
    case 'IntrauterineTransfusion':
      window.localStorage.setItem(
        STORAGE_NAME.IntrauterineTransfusion,
        JSON.stringify(data)
      )
      break
  }
}

//for cvl
export function storeBackupData4(data) {
  window.localStorage.setItem(
    STORAGE_NAME.lastActiveTabData4,
    JSON.stringify(data)
  )
}

export function cleanUpContent(content, from = null) {
  // console.log('cleanUpContent', content)
  let newContent = content

  if (from === 'template') {
    // console.log('remove class and attribute')
    newContent = removeDataAtr(newContent)
    newContent = removeClass(newContent)
    // newContent = replacePwithBR(newContent)
  }

  newContent = removeFontFamily(newContent)
  newContent = removeId(newContent)

  newContent = newContent.replace(/>HIS</gm, '><')
  newContent = newContent.replace(/<div[^>]*>?/gm, '')
  newContent = newContent.replace(/<\/div>/gm, '')
  // newContent = newContent.replace(/<span[^>]*>?/gm, '')
  // newContent = newContent.replace(/<\/span>/gm, '')
  // newContent = newContent.replace(/<a[^>]*>?/gm, '')
  // newContent = newContent.replace(/<\/a>/gm, '')

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

  // newContent = parseImage64(newContent)
  newContent = newContent.replace(new RegExp('<upper', 'g'), `&lt;upper`)
  newContent = newContent.replace(new RegExp('<lower', 'g'), `&lt;lower`)
  newContent = newContent.replace(/<p><\/p>/gm, '')
  newContent = checkTableAndNoRoot(newContent)
  // console.log('cleanup')
  let hasInvalidRegex = /<(?!\/?(p|span|strong|br|em)\b)[^>]/gi
  // let regex = /<(?!\s*\/?\s*(p|span|strong|br|em)\b.*?>)/gi

  if (newContent.match(hasInvalidRegex)) {
    // console.log('found invalid tag')
    let regex = /<\s*\/?\s*(p|span|strong|br|em)\b.*?>/gi
    let validTags = newContent.match(regex)
    let testcontent = newContent

    let v = []
    for (let i = 0; i < validTags.length; i++) {
      v[i] = validTags[i].replace(/</g, '&lt;')
      testcontent = testcontent.replace(validTags[i], v[i])
    }

    testcontent = testcontent.replace(/</g, '&lt;')

    for (let i = 0; i < v.length; i++) {
      testcontent = testcontent.replace(v[i], validTags[i])
    }
    newContent = testcontent
  }

  // console.log(newContent)

  return newContent
}

export function reFormatSpace(content) {
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

export function replacePwithBR(content) {
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

export function removeId(content) {
  // console.log(content)
  const regex = /id="[a-zA-Z0-9:;.\s()\-_,]*"/gm
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

export function removeDataAtr(content) {
  // console.log(content)

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

export function removeClass(content) {
  // console.log(content)
  const regex = /class="[a-zA-Z0-9:;.\s()\-_,]*"/gm
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

export function removeFontFamily(content) {
  // console.log(content)
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

export function checkTableAndNoRoot(content) {
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

export async function callImageViewer(hn, accession, modality) {
  if (window.OPEN_IMAGE_VIEWER) window.OPEN_IMAGE_VIEWER.close()

  try {
    const response = await axios.get(API.EV_LINK, {
      params: {
        accession,
        hn,
        modality,
        openType: 'image',
      },
    })
    // const evlink = response.data.data.evlink + '&ASS_NO=' + accession
    const evlink = response.data.data.evlink
    // console.log(evlink)
    window.OPEN_IMAGE_VIEWER = window.open(
      evlink,
      '_blank',
      `top=${(window.screen.height - 25) / 2}, left=${
        (window.screen.width - 25) / 2
      }, location=0 ,addressbar=0 , toolbar=0, width=25, height=25, scrollbars=1`
    )

    if (window.OPEN_IMAGE_VIEWER != null) window.OPEN_IMAGE_VIEWER.blur()

    window.OPEN_IMAGE_VIEWER.focus()
  } catch (error) {
    console.log(error)
  }
}

export async function printPdf(
  type,
  patient,
  systemProperties,
  doctor,
  user,
  allowBackup = false,
  setOpenBackDrop = null
) {
  try {
    if (allowBackup) {
      const res = await axios.get(`${API.BACKUP_PDF}`, {
        params: {
          accession: patient.accession,
          r: Math.random(),
        },
      })

      if (res.data.hasBackup) {
        // console.log('has backup pdf')
        return printJS({
          printable: res.data.url,
          type: 'pdf',
          // base64: true,
        })
      }
    }

    if (systemProperties?.backdropLoading === 'YES' && setOpenBackDrop)
      setOpenBackDrop(true)

    const [docDef] = await getDocDef(
      type,
      patient,
      systemProperties,
      doctor,
      user
    )

    // setTimeout(() => {
    if (setOpenBackDrop && systemProperties?.backdropLoading === 'YES')
      setOpenBackDrop(false)

    const pdfDocGenerator = pdfMake.createPdf(docDef)
    pdfDocGenerator.getDataUrl(dataUrl => {
      // console.log('new create')
      const base64 = dataUrl.replace('data:', '').replace(/^.+,/, '')
      printJS({ printable: base64, type: 'pdf', base64: true })
    })
    // }, 2000)
  } catch (error) {
    if (setOpenBackDrop && systemProperties?.backdropLoading === 'YES')
      setOpenBackDrop(false)
    console.log(error)
  }
}

export async function viewPdf(
  patient,
  systemProperties,
  doctor,
  user,
  allowBackup = false,
  setOpenBackDrop = null
) {
  try {
    // console.log('appMode', systemProperties.appMode)
    // console.log('fixLocation', systemProperties.fixLocation)
    if (allowBackup) {
      const res = await axios.get(`${API.BACKUP_PDF}`, {
        params: {
          accession: patient.accession,
          r: Math.random(),
        },
      })

      if (res.data.hasBackup) {
        // console.log('has backup pdf')
        // return openPopup('data:application/pdf;base64,' + res.data.base64,res.data.url)
        return openPopup(null, res.data.url)
      }
    }

    if (systemProperties?.backdropLoading === 'YES' && setOpenBackDrop)
      setOpenBackDrop(true)

    const [docDef] = await getDocDef(
      'worklist',
      patient,
      systemProperties,
      doctor,
      user
    )

    // setTimeout(() => {
    const pdfDocGenerator = pdfMake.createPdf(docDef)

    if (setOpenBackDrop && systemProperties?.backdropLoading === 'YES')
      setOpenBackDrop(false)

    openPopup2(pdfDocGenerator)
    // }, 2000)
  } catch (error) {
    if (setOpenBackDrop && systemProperties?.backdropLoading === 'YES')
      setOpenBackDrop(false)
    console.log(error)
  }
}

function openPopup(dataUrl, url) {
  if (window.PREVIEW_REPORT1) window.PREVIEW_REPORT1.close()
  if (window.PREVIEW_REPORT2) window.PREVIEW_REPORT2.close()

  const width = 820
  const height = 800
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2
  const options = `top=${top},left=${left},location=no,menubar=no,addressbar=no,toolbar=0,width=${width},height=${height},scrollbars=yes`

  if (url) {
    return (window.PREVIEW_REPORT1 = window.open(url, 'PdfWindow', options))
  }

  window.PREVIEW_REPORT2 = window.open('', 'PdfWindow', options)
  // <embed width="100%" height="100%" src="${dataUrl}" type="application/pdf" />
  let html = `
      <html>
        <title>View Report</title>
        <body style="margin:0!important">
        <embed width="100%" height="100%" src="${dataUrl}" />
        </body>
      </html>
      `
  sleep(0).then(() => window.PREVIEW_REPORT2?.document?.write(html))

  window.PREVIEW_REPORT2?.focus()
}

function openPopup2(pdfDocGenerator) {
  if (window.PREVIEW_REPORT1) window.PREVIEW_REPORT1.close()
  if (window.PREVIEW_REPORT2) window.PREVIEW_REPORT2.close()

  const width = 820
  const height = 800
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2
  const options = `top=${top},left=${left},location=no,menubar=no,addressbar=no,toolbar=0,width=${width},height=${height},scrollbars=yes`

  window.PREVIEW_REPORT2 = pdfDocGenerator.open(
    {},
    window.open('', 'PdfWindow', options)
  )

  window.PREVIEW_REPORT2?.focus()
}

export function removeImageFromContent(content) {
  // let contentWithOutImage = new DOMParser().parseFromString(
  //   `<div>${content}</div>`,
  //   'text/html'
  // ).body.childNodes[0]

  // contentWithOutImage
  //   .querySelectorAll('table,tr,td,img')
  //   .forEach(e => e.remove())

  // contentWithOutImage.querySelectorAll('img').forEach(e => e.remove())
  // contentWithOutImage = contentWithOutImage.outerHTML
  //   .replace('<div>', '')
  //   .replace('</div>', '')
  //   .replace('<p></p>', '')
  //   .replace('<p>&nbsp;</p>', '')
  //   .replace('<p>&nbsp; </p>', '')
  //   .replace('<p>&nbsp; &nbsp;</p>', '')
  //   .replace('<p>&nbsp; &nbsp; &nbsp;</p>', '')
  //   .trim()

  // return contentWithOutImage

  return content.replace(/<img[^>]*>/g, '')
}

export function openImage(uniwebAddress, accession) {
  if (window.OPEN_IMAGE_VIEWER) window.OPEN_IMAGE_VIEWER.close()

  const link = `${uniwebAddress}DicomWeb.dll/OpenImage?User=1&Password=1&ACCNO=${accession}`

  window.OPEN_IMAGE_VIEWER = window.open(
    link,
    'ImageWindow',
    `top=${(window.screen.height - 25) / 2}, left=${
      (window.screen.width - 25) / 2
    }, location=0 ,addressbar=0 , toolbar=0, width=25, height=25, scrollbars=1`
  )

  if (window.OPEN_IMAGE_VIEWER != null) window.OPEN_IMAGE_VIEWER.blur()
}

export function createHtml(reportTemplate, studyType, noFetus) {
  let name = []
  let content = []
  let n = ''
  let t = ''
  // console.log(reportTemplate)
  let key = Object.keys(reportTemplate['1'])
    .map(key => parseInt(key))
    .filter(key => {
      if (studyType === '1') return obTemplateId.includes(key)

      return gynTemplateId.includes(key)
    })

  if (studyType === '2') {
    Object.keys(reportTemplate['1']).forEach(k => {
      // not include mesurement and doppler
      if (!['31', '32'].includes(k)) {
        if (key.includes(parseInt(k)) && reportTemplate['1'][k].length > 0) {
          content.push(reportTemplate['1'][k])
          name.push(parseInt(k))
        }
      }
    })

    for (let i = 0; i < content.length; i++) {
      let tname = findTemplateName(name[i])
      content[i]
        // .filter(
        //   c =>
        //     c.type === 'A' ||
        //     ['comment', 'comments', 'summary'].includes(
        //       c.valueName?.toLowerCase()
        //     ) ||
        //     ['comment', 'comments', 'summary'].includes(
        //       c.display?.toLowerCase()
        //     )
        // )
        .forEach((c, i, row) => {
          if (i === 0) {
            t = `<p><strong style="font-size:20px">${tname}</strong><br />`
          }

          t += `<strong>${c.display?.trim() || c.valueName}:</strong> ${
            c.content || c.contentOptionDisplay
          }<br />`

          if (i === row.length - 1) {
            //   t = t.slice(0, -2)
            t += '</p>'
          }
        })

      n += t
    }
  } else {
    // console.log(reportTemplate)
    for (let i = 1; i <= noFetus; i++) {
      let fetus = FETUS_NAME[i]

      Object.keys(reportTemplate[i]).forEach(k => {
        // not include mesurement and doppler
        if (!['1', '2'].includes(k)) {
          if (key.includes(parseInt(k)) && reportTemplate[i][k].length > 0) {
            content.push(reportTemplate[i][k])
            name.push(parseInt(k))
          }
        }
      })

      for (let i = 0; i < content.length; i++) {
        let tname = findTemplateName(name[i])

        content[i]
          // .filter(
          //   c =>
          //     c.type === 'A' ||
          //     ['comment', 'comments', 'summary'].includes(
          //       c.valueName?.toLowerCase()
          //     ) ||
          //     ['comment', 'comments', 'summary'].includes(
          //       c.display?.toLowerCase()
          //     )
          // )
          .forEach((c, i, row) => {
            if (i === 0) {
              t += `<p><strong style="font-size:20px">${tname}</strong>${
                noFetus > 1 ? ` (Fetus ${fetus})` : ''
              }<br />`
            }

            t += `<strong>${c.display?.trim() || c.valueName}:</strong> ${
              c.content || c.contentOptionDisplay
            }<br />`

            if (i === row.length - 1) {
              //   t = t.slice(0, -2)
              t += '</p>'
            }
          })

        n += t
        t = ''
      }

      content = []
      name = []
    }
  }

  return n
}

function findTemplateName(id) {
  let name = Object.keys(TEMPLATES).filter(key => {
    return TEMPLATES[key].id === id
  })

  return TEMPLATES[name[0]].display
}

export async function initFormSend(
  data,
  reportId,
  templateId,
  isMeasurement = false
) {
  const res = await axios.get(API.REPORT_FORM, {
    params: {
      templateId,
    },
  })
  const form = res.data.data

  let formSend = {}
  if (isMeasurement) {
    const EDF = [39, 44, 49, 54, 59]

    form.forEach(f => {
      formSend[f.valueId] = {
        freeName: '',
        freeUnit: '',
        type: EDF.includes(f.valueId) ? 'S' : f.type,
        value: '',
      }
    })
    Object.keys(formSend).forEach(key => {
      const t = data.find(d => d.refValueId == key)
      if (t) {
        formSend[key].freeName = t.contentFreeValueName
        formSend[key].freeUnit = t.contentFreeValueUnit
        formSend[key].value =
          !t.contentOption || t.contentOption === 0
            ? t.content
            : t.contentOption
      }
    })
  } else {
    // const alwayTypeT = [716, 733, 747, 761, 782]
    const alwayTypeT = ['Contraindications Text', 'Complication Define']
    form.forEach(f => {
      formSend[f.valueId] = {
        type: alwayTypeT.includes(f.name) ? 'T' : f.type,
        value: '',
      }
    })
    if (templateId === 9) {
      Object.keys(formSend).forEach((key, i) => {
        const t = data?.find(d => d.refValueId == key)
        if (t) {
          formSend[key].value =
            !t.contentOption || t.contentOption === 0
              ? t.content
              : t.contentOption
        }

        if (![25, 26, 27, 28, 30].includes(i)) {
          formSend[key]['type'] = 'S'
          formSend[key]['freetext'] = t?.contentOptionFreeText || ''
          formSend[key]['checkbox'] = t?.contentOptionCheckBox || ''
          formSend[key]['content'] = t?.content || ''
        }
      })
    } else {
      // console.log(formSend)
      // console.log(data)
      // console.log(templateId)

      Object.keys(formSend).forEach(key => {
        const t = data?.find(d => d.refValueId == key)
        if (t) {
          formSend[key].value =
            !t.contentOption || t.contentOption === 0
              ? t.content
              : t.contentOption
        }
      })

      if (templateId === 41) {
        // invasive - prerequisite data
        let procedures = data
          .filter(d => d.refValueId === 717)
          .map(d => ({ type: 'S', value: d.contentOption }))
          ?.sort((a, b) => a.value - b.value)

        if (procedures[0]?.contentOptionDisplay !== 'Other') {
          formSend[717] = procedures
          // console.log(procedures)
        }
      } else if (templateId === 3) {
        // ob diagnosis
        let fetusDiagnosis = data
          .filter(d => d.refValueId === 69)
          .map(d => ({ type: 'S', value: d.contentOption }))
          ?.sort((a, b) => a.value - b.value)

        formSend[69] = fetusDiagnosis
      } else if (templateId === 38) {
        // gyn diagnosis
        let fetusDiagnosis = data
          .filter(d => d.refValueId === 630)
          .map(d => ({ type: 'S', value: d.contentOption }))
          ?.sort((a, b) => a.value - b.value)

        formSend[630] = fetusDiagnosis
      }
    }
  }

  // console.log(formSend)

  formSend['reportId'] = reportId

  return [formSend, form]
}

function combineIndications(data) {
  if (!data) return ''

  return manageComma(
    data.indicationSelect.replace(/&lt;/g, '<').split('|').join(', ') +
      (data.indicationSelect !== '' && data.indication !== '' ? ', ' : '') +
      data.indication
  )
}

export function manageComma(txt) {
  return txt
    .replace(/\s+/g, ' ')
    .replace(/,/g, ', ')
    .replace(/ , /g, ', ')
    .replace(/\s+/g, ' ')
}

export function fmt(value) {
  let t
  return (
    value >= 0x0 ? (t = '' + (value + 0.00005)) : (t = '' + (value - 0.00005)),
    t['substring'](0x0, t['indexOf']('.') + 0x2)
  )
}

export function roundNumber(value1, value2) {
  return (
    Math['round'](value1 * Math['pow'](0xa, value2)) / Math['pow'](0xa, value2)
  )
}

export function computeMOM(doppler, patient, setMom = null) {
  let ltMCA = doppler.find(d => d.contentValueName === 'Lt.MCA')
  let rtMCA = doppler.find(d => d.contentValueName === 'Rt.MCA')
  if ((patient.edcGa || patient.usGa) && (ltMCA || rtMCA)) {
    let ltMOM, rtMOM
    let splitGA = patient.edcGa
      ? patient.edcGa.split('w')
      : patient.usGa.split('w')
    let weeks = parseInt(splitGA[0])
    // console.log('weeks', weeks)
    // console.log('splitGA', splitGA)

    let days
    if (splitGA[1] === '') days = 0
    else days = parseInt(splitGA[1].replace('d', '')) / 0x7

    // console.log('days', days)
    let lmca = ltMCA ? parseFloat(ltMCA.content) : 0
    let rmca = rtMCA ? parseFloat(rtMCA.content) : 0
    let weeks2 = 0x1 * weeks + 0x1 * days

    let mps = fmt(Math['exp'](2.31 + 0.04643 * weeks2))
    ltMOM = roundNumber(lmca / mps, 0x3)
    rtMOM = roundNumber(rmca / mps, 0x3)
    // console.log('ltMOM', ltMOM)
    // console.log('rtMOM', rtMOM)
    let temp = { 'Lt.MCA': null, 'Rt.MCA': null }
    if (ltMCA) temp['Lt.MCA'] = ltMOM
    if (rtMCA) temp['Rt.MCA'] = rtMOM

    // console.log('temp', temp)

    if (!setMom) return temp

    setMom(temp)
  }
}

export function computeUaPi95(pi, patient) {
  if (patient?.edcGa?.includes('w') || patient?.usGa?.includes('w')) {
    let ga = patient?.edcGa || patient?.usGa
    ga = parseInt(ga.split('w')[0])

    if (ga >= 20 && ga <= 40) {
      if (parseFloat(pi) > doppler_uma_pi_95p[ga]) {
        return doppler_uma_pi_95p[ga]
      }
    }
  }
}
