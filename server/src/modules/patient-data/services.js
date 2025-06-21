const dayjs = require('dayjs')

const db = require('../../db/setup')
const { Logger, logFormat } = require('../../logger')
const { dateToDBformat } = require('../../utils/utils')
const { addLogs, MODULE } = require('../logs/services')
const { getSyspropsValue } = require('../../cache/cache')

async function createOrder(req) {
  // console.log('createOrder', req.body)
  try {
    const { protocol, accession, locationCode, patient } = req.body
    const countryId =
      (await getSyspropsValue('countryId')) || '1.2.410.2000010.66'
    const hspId = (await getSyspropsValue('hspId')) || '12345'
    const uidExt = (await getSyspropsValue('uidExt')) || '1.1.1.1.1.1.1'
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    const year = timestamp.substring(0, 4)
    const month = timestamp.substring(4, 6)
    const day = timestamp.substring(6, 8)
    const HH = timestamp.substring(8, 10)
    const mm = timestamp.substring(10, 12)
    const ss = timestamp.substring(12, 14)
    const orderDate = `${year}${month}${day}`
    const orderTime = `${HH}${mm}${ss}`
    const dateTh = `${day}/${month}/${year}`
    const timeTh = `${HH}:${mm}:${ss}`
    const fDate = `${dateTh} ${timeTh}`
    const name = patient.name.replace('  ', ' ') || ''
    const nameEn = patient.nameEn?.replace('  ', ' ') || ''
    const gender = patient.gender || 'M'
    const hn = patient.hn
    const hnSearch = patient.hn.replace(/-/g, '')

    let length = protocol.length
    let acc, instanceUID
    for (let i = 0; i < length; i++) {
      acc = i === 0 ? accession : accession + i
      instanceUID = `${countryId}.${hspId}.${acc}.${uidExt}.${i}`
      await db('RIS_DATA').insert({
        TRIGGER_DTTM: timestamp,
        REPLICA_DTTM: timestamp,
        EVENT_TYPE: acc,
        CHARACTER_SET: 'ISO_IR 100',
        SCHEDULED_DTTM: timestamp,
        SCHEDULED_MODALITY: protocol[i].modality,
        SCHEDULED_LOCATION: locationCode,
        SCHEDULED_PROC_ID: protocol[i].code,
        SCHEDULED_PROC_DESC: protocol[i].desc || protocol[i].name,
        SCHEDULED_PROC_STATUS: '100',
        REQUESTED_PROC_ID: protocol[i].modality,
        REQUESTED_PROC_CODES: req.user?.code || '',
        REQUESTED_PROC_PRIORITY: '2',
        REQUESTED_PROC_REASON: '',
        IMAGING_REQUEST_COMMENTS: '',
        STUDY_INSTANCE_UID: instanceUID,
        ACCESSION_NO: acc,
        PERFORM_DOCTOR: '',
        REQUEST_DOCTOR: '',
        REFER_DOCTOR: '',
        REQUEST_DEPARTMENT: '',
        ADMISSION_ID: '',
        IMAGING_REQUEST_DTTM: timestamp,
        PATIENT_TRANSPORT: acc,
        PATIENT_LOCATION: 'I',
        PATIENT_NAME: name,
        PATIENT_ID: hn,
        OTHER_PATIENT_NAME: nameEn,
        PATIENT_BIRTH_DTTM: patient.dob,
        PATIENT_SEX: gender,
        PATIENT_SIZE: '2',
        PATIENT_STATE: '55',
        SPECIALTY: 'Q',
        REGISTER_DTTM: dateTh,
        REF_HN: hn,
        PATIENT_ID_SEARCH: hnSearch,
        SPECIAL_NEEDS: '',
        DIAGNOSIS: '',
      })

      await db('PACS_STUDY').insert({
        STUDY_INSTANCEUID: instanceUID,
        STUDY_ID: protocol[i].code,
        STUDY_DATE: orderDate,
        STUDY_TIME: orderTime,
        STUDY_DESCRIPTION: protocol[i].desc || protocol[i].name,
        ACCESSION_NUMBER: acc,
        MODALITY: protocol[i].modality,
        PATIENT_ID: hn,
        PATIENT_UID: hn,
        PATIENT_AGE: '',
        PATIENT_SIZE: '2',
        REFERENCED_STUDY_SEQUENCE: fDate,
        NAME_OF_PHYSICS_READING_STUDY: '',
        OPERATORS_NAME: timestamp,
        INSTITUTION_NAME: locationCode,
        INSTITUIONAL_DEPARTMENT_NAME: '',
        STUDY_EXPECT_RESULT: '',
        STUDY_STATUS: 'N',
        REQUEST_DOCTOR: 'A',
        REPORTED_DOCTOR: '',
        STUDY_PRIORITY: '2',
        PATIENT_NAME: name,
        PATIENT_SEX: gender,
        NOTIFICATION: '0',
        OTHER_PATIENT_NAME: nameEn,
        STUDY_FAVORITE: '0',
        QC_STATUS: 'A',
        BILLING_STATUS: 'N',
        REF_HN: hn,
        PATIENT_ID_SEARCH: hnSearch,
        VIEW_STATUS: 'N',
        IMAGE_STATUS: '',
      })

      addLogs(req, {
        module: MODULE.REGISTRATION,
        activity: `Create order: ${name}, ${
          protocol[i].desc || protocol[i].name
        }`,
        accession: acc,
      })
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.createOrder = createOrder

exports.getTags = async accession => {
  try {
    const data = await db('RIS_TAG_RELATION')
      .leftJoin(
        'RIS_TAG_MASTER',
        'RIS_TAG_RELATION.TR_TAG_ID',
        'RIS_TAG_MASTER.TAG_SYS_ID'
      )
      .where({ TR_REF_ITEM_ID: accession })
      .column(
        { id: 'RIS_TAG_MASTER.TAG_SYS_ID' },
        { name: 'RIS_TAG_MASTER.TAG_NAME' }
      )
      .orderBy([{ column: 'RIS_TAG_MASTER.TAG_NAME', order: 'asc' }])

    return data.map(d => d.name)
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.createPatient = async req => {
  // console.log('createPatient')
  const { data } = req.body
  // console.log(data)
  try {
    const res = await db('RIS_PATIENT_REGISTRATION').where(
      'PATIENT_HN',
      data.hn
    )

    if (res.length > 0) {
      return 'exist'
    }

    await db('RIS_PATIENT_REGISTRATION').insert({
      PATIENT_HN: data.hn,
      PATIENT_NAME: data.nameTh,
      PATIENT_ENAME: data.nameEn || data.nameTh,
      PATIENT_ALLERGY: data.allergy,
      PATIENT_BIRTH_DTTM: dateToDBformat(data.dob),
      PATIENT_SEX: data.gender,
    })

    return true
  } catch (error) {
    console.log(error)
    Logger('error').error(logFormat(null, error))

    return false
  }
}

async function getPatientRegistrationByHN(hn) {
  try {
    const data = await db('RIS_PATIENT_REGISTRATION')
      .column({
        hn: 'PATIENT_HN',
        name: 'PATIENT_NAME',
        otherName: 'PATIENT_ENAME',
        birthDate: 'PATIENT_BIRTH_DTTM',
        gender: 'PATIENT_SEX',
        email: 'PATIENT_EMAIL',
        weight: 'PATIENT_WEIGHT',
        height: 'PATIENT_SIZE',
        idCard: 'PATIENT_ID_CARD_NO',
        mobile: 'PATIENT_MOBILE_NO',
        emergencyContact: 'PATIENT_EMERGENCY_CONTACT',
        nation: 'PATIENT_NATIONALITY_DETAIL',
        address: 'PATIENT_ADDRESS',
        type: 'PATIENT_TYPE',
        allergy: 'PATIENT_ALLERGY',
      })
      .where('PATIENT_HN', hn)

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getPatientRegistrationByHN = getPatientRegistrationByHN

async function getTemplateData(accession, fetus = '1') {
  try {
    const [data1, data2, data3] = await Promise.all([
      await db.raw(`
      SELECT DISTINCT(REF_TEMPLATE_ID) FROM OB_REPORT
      LEFT JOIN OB_REPORT_CONTENT ON OB_REPORT_CONTENT.REF_REPORT_ID = OB_REPORT.REPORT_ID
      WHERE ACCESSION = '${accession}' AND CONTENT_ID IS NOT NULL AND REPORT_FETUS_NO='${fetus}'
    `),
      await db.raw(`
      SELECT IM_ACC FROM RIS_IMAGE_REPORT WHERE IM_ACC = '${accession}'
      `),
      await db.raw(`
        SELECT REPORT_MANUAL_CONTENT FROM RIS_DIAGNOSTIC_REPORT WHERE REF_ITEM_ID = '${accession}' 
        `),
    ])

    const returnData = {
      reportTemplateId: data1?.map(d => d.REF_TEMPLATE_ID) || [],
      hasImage: data2?.length > 0,
      hasManualContent: data3[0]?.REPORT_MANUAL_CONTENT ? true : false,
    }

    return returnData
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getTemplateData = getTemplateData
