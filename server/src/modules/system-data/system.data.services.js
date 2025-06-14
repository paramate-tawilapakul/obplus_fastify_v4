const dayjs = require('dayjs')

const { updateSystemPropertiesCache } = require('../../cache/cache')
const db = require('../../db/config')
const { Logger, logFormat } = require('../../logger')
const { paginationQueryBuilder, updateDB } = require('../../utils/db_utils')
const { objectArrayToCamel } = require('../../utils/utils')

function getPageNumForPagination(pageNum, rowsPerPage) {
  if ((pageNum && rowsPerPage) || typeof pageNum === 'string') {
    return {
      pageNum: (parseInt(pageNum) - 1) * parseInt(rowsPerPage),
      rowsPerPage: parseInt(rowsPerPage),
    }
  }
  return { pageNum: 0, rowsPerPage: 100 }
}

exports.getPatientRegisData = async hn => {
  try {
    const data = await db
      .select()
      .column({
        hn: 'PATIENT_HN',
        name: 'PATIENT_NAME',
        nameEn: 'PATIENT_ENAME',
        dob: 'PATIENT_BIRTH_DTTM',
        gender: 'PATIENT_SEX',
      })

      .where('PATIENT_HN', hn)
      .from('RIS_PATIENT_REGISTRATION')
      .limit(1)
    //.timeout(1000)

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getLocations = async () => {
  try {
    const data = await db
      .select()
      .column(
        { id: 'LOCATION_SYS_ID' },
        { sysId: 'LOCATION_SYS_ID' },
        { code: 'LOCATION_CODE' },
        { name: 'LOCATION_NAME' },
        { desc: 'LOCATION_DESCRIPTION' }
      )
      .from('RIS_LOCATION')
      .orderBy([{ column: 'LOCATION_CODE', order: 'asc' }])

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getSystemProperties = async () => {
  try {
    const data = await db
      .select()
      .column({ name: 'SYS_PROPERTY' }, { value: 'SYS_VALUE' })
      .from('RIS_SYSTEM_PROPERTIES')
      .orderBy([{ column: 'SYS_PROPERTY', order: 'asc' }])

    const defaultDateAndDefaultList = await db
      .select()
      .from('RIS_DEFAULT_DATE')
      .orderBy([{ column: 'RIS_DATE_SYS_ID', order: 'asc' }])
      .limit(1)

    let arrToObj = data.reduce((obj, item) => {
      obj[item.name] = item.value
      return obj
    }, {})

    arrToObj['serverProperties'] = {
      HOST: process.env.SERVER_IP,
      SERVER_PORT: parseInt(process.env.SERVER_PORT),
    }
    arrToObj['defaultDate'] = defaultDateAndDefaultList[0].RIS_DEFAULT_DATE
    arrToObj['defaultList'] = defaultDateAndDefaultList[0].RIS_DEFAULT_LIST
    arrToObj['appMode'] = process.env.NODE_ENV
    // arrToObj['dictionaryServer'] = process.env.DICTIONARY_SERVER
    arrToObj['reportSearchServer'] = process.env.REPORT_SEARCH_SERVER || ''
    arrToObj['obFeedback'] = process.env.OB_FEEDBACK || ''
    arrToObj['previewAfterVerified'] = process.env.PREVIEW_AFTER_VERIFIED || ''
    arrToObj['showTabDataChecked'] = process.env.SHOW_TAB_DATA_CHECKED || ''
    arrToObj['fixLocation'] = process.env.FIX_LOCATION || ''
    arrToObj['backdropLoading'] = process.env.BACKDROP_LOADING || ''
    arrToObj['efwCharts'] = process.env.EFW_CHARTS || 'HL3'

    arrToObj = objectArrayToCamel([arrToObj])

    // arrToObj[0] = { ...arrToObj[0], hspName }

    // arrToObj[0] = {
    //   ...arrToObj[0],
    //   hspName: 'RVH',
    // }

    if (process.env.FIX_LOCATION === 'YES') {
      arrToObj[0] = {
        ...arrToObj[0],
        hspName: 'RVH',
        reportHeaderPath:
          'C:\\\\apps\\\\config\\\\unireport\\\\images\\\\rjh_report_header.jpg',
      }
    }

    if (process.env.SAMPLE_IMAGE === 'YES') {
      arrToObj[0] = {
        ...arrToObj[0],
        sampleImage: 'YES',
      }
    }

    return [arrToObj[0], data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getDoctor = async () => {
  try {
    const data = await db
      .select(
        // 'RAD_SYS_ID as id',
        'RAD_CODE as radCode',
        'RAD_NAME as radName',
        'RAD_DESCRIPTION as radDesc',
        'RAD_DESCRIPTION_ENG as radDescEng',
        'RAD_USER_NAME as radUserName',
        // 'RAD_PRIMARY_KEY as radPrimaryKey',
        // 'ONLINEL_FLAG as isOnline',
        'RAD_TYPE as radType',
        // 'RAD_LOCATION as radLocation',
        'RIS_USER_GROUP.GR_NAME as radTypeName'
      )
      .join(
        'RIS_USER_GROUP',
        'RIS_USER_GROUP.GR_TYPE_ID',
        '=',
        'RIS_RADIOLOGIST.RAD_TYPE'
      )
      .from('RIS_RADIOLOGIST')
      .where('RAD_TYPE', '=', '2')
      .orWhere('RAD_TYPE', '=', '4')
      .orWhere('RAD_TYPE', '=', '1')
      .orWhere('RAD_TYPE', '=', '3')
      .orderBy(['RAD_DESCRIPTION'])

    // let newData = data.filter(d => d.radName !== 'QN')

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getTimeGuarantee = async () => {
  try {
    const data = await db
      .select()
      .from('RIS_MODALITY')
      .orderBy([{ column: 'MD_CODE', order: 'asc' }])

    let newObj = {}
    data.forEach(d => {
      newObj[d.MD_CODE] = {
        timePolicyHH: d.MD_TIME_POLICY_HH,
        timePolicyMM: d.MD_TIME_POLICY_MM,
        timeFinallizeHH: d.MD_TIME_FINALIZE_HH,
        timeFinallizeMM: d.MD_TIME_FINALIZE_MM,
      }
    })

    return [newObj, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getMasterTags = async () => {
  try {
    const data = await db('RIS_TAG_MASTER')
      .column({ id: 'TAG_SYS_ID' }, { name: 'TAG_NAME' })
      .orderBy([{ column: 'TAG_NAME', order: 'asc' }])

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getIndications = async () => {
  try {
    const data = await db('OB_INDICATIONS')
      .column({ id: 'ID' }, { name: 'NAME' }, { type: 'TYPE' })
      .where('NAME', '<>', 'Other')

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getAvailableProtocol = async req => {
  const { filter } = req.query

  function whereBuilder(b, filter) {
    if (!filter) return

    return b
      .where('PROTOCOL_CODE', 'like', `%${filter}%`)
      .orWhere('PROTOCOL_NAME', 'like', `%${filter}%`)
      .orWhere('PROTOCOL_DESCRIPTION', 'like', `%${filter}%`)
  }

  try {
    const columns = {
      sysId: 'PROTOCOL_SYS_ID',
      code: 'PROTOCOL_CODE',
      name: 'PROTOCOL_NAME',
      description: 'PROTOCOL_DESCRIPTION',
      modality: 'PROTOCOL_MODALITY',
      locationId: 'PROTOCOL_LOCATION',
    }
    const data = await db
      .select()
      .column(columns)
      .from('RIS_PROTOCOL')
      .where(builder => whereBuilder(builder, filter))
      .orderBy('PROTOCOL_CODE', 'asc')

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.checkIsExist = async req => {
  try {
    const { table, column, value } = req.query

    const data = await db.select().from(table).where(column, '=', value)
    // console.log(data)

    return data.length
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getUserByGroup = async req => {
  try {
    const { rowsPerPage, pageNum, typeId, isQuickSearch, filter } = req.query

    const table = ' RIS_RADIOLOGIST '
    let orderBy = `  ORDER BY RAD_SYS_ID desc `
    let qtrType = typeId !== '0' ? ` AND RAD_TYPE = '${typeId}' ` : ''
    let where = ` WHERE RAD_NAME <> 'QN' AND RAD_NAME <> 'QE' ${qtrType}`

    if (isQuickSearch === 'yes') {
      where += ` AND (RAD_CODE = '${filter}' OR RAD_DESCRIPTION LIKE '%${filter}%' OR RAD_DESCRIPTION_ENG LIKE '%${filter}%') `
    }
    const sql = paginationQueryBuilder({
      columns: null,
      rowsPerPage,
      pageNum,
      table,
      where,
      orderBy,
    })

    const sqlCount = `
        SELECT COUNT(*) as total FROM ${table}
        ${where}
    `

    const [rows, total] = await Promise.all([db.raw(sql), db.raw(sqlCount)])

    return [rows, total[0]['total']]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getAllUserGroup = async () => {
  try {
    const data = await db
      .select()
      .column({ id: 'GR_TYPE_ID' }, { name: 'GR_NAME' })
      .from('RIS_USER_GROUP')
      // .where('SYS_PROPERTY', '<>', 'app_version')
      .orderBy([{ column: 'GR_NAME', order: 'asc' }])

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.createUserGroup = async obj => {
  try {
    const data = await db('RIS_USER_GROUP')
      .insert({
        GR_NAME: obj.name,
      })
      .returning('*')

    const allColumns = await db('RIS_PERMISSION')
      .select()
      .where('ID_REF_TYPE', '<>', 0)

    let arr = ''
    for (let i = 1; i <= Object.keys(allColumns[0]).length - 1; i++) {
      arr += "'0',"
    }

    await db.raw(
      `insert into ${'RIS_PERMISSION'} values(${data[0].GR_TYPE_ID},${arr.slice(
        0,
        -1
      )})`
    )

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.updateUserGroup = async obj => {
  try {
    await db('RIS_USER_GROUP')
      .update({
        GR_NAME: obj.name,
      })
      .where('GR_TYPE_ID', obj.id)

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.deleteUserGroup = async id => {
  try {
    await db('RIS_USER_GROUP')
      .where({
        GR_TYPE_ID: id,
      })
      .del()

    await db('RIS_PERMISSION')
      .where({
        ID_REF_TYPE: id,
      })
      .del()

    const allUserByGroup = await db('RIS_RADIOLOGIST')
      .select()
      .column({
        code: 'RAD_CODE',
      })
      .where('RAD_TYPE', '=', id)
      .andWhere('RAD_NAME', '<>', 'QN')
      .andWhere('RAD_NAME', '<>', 'QE')

    let length = allUserByGroup.length
    let code
    for (let i = 0; i < length; i++) {
      code = allUserByGroup[i].code

      await deleteUser(code)
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.createUserGroup = async obj => {
  try {
    const data = await db('RIS_USER_GROUP')
      .insert({
        GR_NAME: obj.name,
      })
      .returning('*')

    const allColumns = await db('RIS_PERMISSION')
      .select()
      .where('ID_REF_TYPE', '<>', 0)

    let arr = ''
    for (let i = 1; i <= Object.keys(allColumns[0]).length - 1; i++) {
      arr += "'0',"
    }

    await db.raw(
      `insert into ${'RIS_PERMISSION'} values(${data[0].GR_TYPE_ID},${arr.slice(
        0,
        -1
      )})`
    )

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.updateUser = async obj => {
  try {
    await updateDB(
      'RIS_RADIOLOGIST',
      {
        RAD_DESCRIPTION: obj.radDescription,
        RAD_DESCRIPTION_ENG: obj.radDescriptionEng,
        RAD_USER_NAME: obj.radUserName,
        // RAD_PASSWORD: obj.radPassword,
        ONLINEL_FLAG: obj.onlinelFlag,
        RAD_ALWAYS_ONLINE: obj.radAlwaysOnline,
        RAD_TYPE: obj.radType,
        // RAD_ORIGINAL_LOCATION: obj.radOriginalLocation,
      },
      {
        RAD_SYS_ID: obj.radSysId,
      }
    )

    // if (result.length > 0) {
    //   await updateUserLocations(obj)
    // }

    // update user password -> usertable
    // await updateDB(
    //   'usertable',
    //   {
    //     password: obj.radPassword,
    //   },
    //   {
    //     userid: obj.radCode,
    //   }
    // )

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.createUser = async obj => {
  try {
    let password = '1234' // default password

    if (process.env.HASH_PASSOWRD === 'YES') {
      const bcrypt = require('bcrypt')
      const saltRounds = 10
      password = await bcrypt.hash(password, saltRounds)
    }

    // const bcrypt = require('bcrypt')
    // const saltRounds = 10
    // const hashPassword = await bcrypt.hash(password, saltRounds)

    await db('RIS_RADIOLOGIST').insert({
      RAD_CODE: obj.radCode,
      RAD_NAME: obj.radCode,
      RAD_USER_ID: obj.radUserId,
      RAD_USER_NAME: obj.radUserName,
      RAD_DESCRIPTION: obj.radDescription,
      RAD_DESCRIPTION_ENG: obj.radDescriptionEng,
      RAD_PASSWORD: '',
      ONLINEL_FLAG: obj.onlinelFlag,
      RAD_ALWAYS_ONLINE: obj.radAlwaysOnline,
      RAD_TYPE: obj.radType,
      RAD_ORIGINAL_LOCATION: 1,
      RAD_TIMESTAMP: dayjs().format('YYYYMMDDHHmmss'),
      RAD_ASSIGN_SLOT: '0',
      RAD_LOCATION: 1,
      RAD_POOL: 'N',
      RAD_ALERT: '1',
      RAD_EXPIRY_DATE: '20501231',
      RAD_ALLOW_ASSIGN: 'N',
    })

    // await updateUserLocations(obj)

    await db('usertable').insert({
      userid: obj.radCode,
      password: password,
      userlocation: 1,
      usercode: obj.radCode,
      username: obj.radCode,
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getPermission = async id => {
  try {
    const data = await db
      .select()
      .column(
        // { ID_REF_TYPE: 'ID_REF_TYPE' },

        { PM_PATIENT: 'PM_PATIENT' },
        { PM_REGISTRATION: 'PM_REGISTRATION' },

        { PM_REPORT: 'PM_REPORT' },
        { PM_RADIOLOGIST_WORKLIST: 'PM_RADIOLOGIST_WORKLIST' },
        { PM_WORKLIST_ALL: 'PM_WORKLIST_ALL' },
        { PM_WORKLIST_UNVERIFIED: 'PM_WORKLIST_UNVERIFIED' },
        { PM_WORKLIST_REPORTED: 'PM_WORKLIST_REPORTED' },

        { PM_REPORT_TEMPLATE: 'PM_REPORT_TEMPLATE' },
        { PM_TEACHING_FILES: 'PM_TEACHING_FILES' },
        { PM_REPORT_SEARCH: 'PM_REPORT_SEARCH' },

        { PM_SYSTEM_CONFIG: 'PM_SYSTEM_CONFIG' },
        { PM_USER: 'PM_USER' },
        { PM_USER_GROUP: 'PM_USER_GROUP' },
        { PM_ORDER: 'PM_ORDER' },
        { PM_TIME_GUARANTEE: 'PM_TIME_GUARANTEE' },
        { PM_SYSTEM_PROPERTIES: 'PM_SYSTEM_PROPERTIES' },
        { PM_SECUTIRY: 'PM_SECUTIRY' }
      )
      .from('RIS_PERMISSION')
      .where('ID_REF_TYPE', '=', id)

    return data[0] || null
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.updatePermission = async obj => {
  try {
    await updateDB('RIS_PERMISSION', obj.data, {
      ID_REF_TYPE: obj.id,
    })
    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getSysProperties = async () => {
  try {
    const data = await db
      .select()
      .column(
        { id: 'SYS_ID' },
        { name: 'SYS_PROPERTY' },
        { value: 'SYS_VALUE' }
      )
      .from('RIS_SYSTEM_PROPERTIES')
      .where('SYS_PROPERTY', '<>', 'app_version')
      .orderBy([{ column: 'SYS_PROPERTY', order: 'asc' }])
    // console.log(data)

    const exceptKey = [
      // 'appVersion',
      // 'copyImageClipboardService',
      // 'countryId',
      // 'doctorConsultService',
      // 'doctorScheduleAddress',
      // 'doctorScheduleService',
      // 'orderBlockReassignService',
      // 'orderCreateWorklistService',
      // 'orderDocviewService',
      // 'orderEditAfterReport',
      // 'orderFlowArrivePrint',
      // 'orderFlowAutoRefresh',
      // 'orderFlowAutoRefreshTime',
      // 'orderHubService',
      // 'orderLabService',
      // 'orderPorterService',
      // 'orderValidateDescriptionService',
      // 'orderValidateReportService',
      // 'passwordLength',
      // 'passwordRequireCapital',
      // 'passwordRequireNumber',
      // 'printPreviewService',
      // 'reportAttachmentService',
      // 'reportBlockAlertService',
      // 'reportCachePath',
      // 'reportCacheService',
      // 'reportConfirmPreviewService',
      // 'reportDraftAlertService',
      // 'reportEditBeforeViewService',
      // 'reportEditorFullWidthService',
      // 'reportFontPath',
      // 'reportFormatTemplate',
      // 'reportHideOrigitalContent',
      // 'reportImpressionService',
      // 'reportIndexPath',
      // 'reportIndexService',
      // 'reportIndexType',
      // 'reportTagService',
      // 'reportVerifiedAlertService',
      // 'reportWorklistInitSearch',
      // 'sharemiPath',
      // 'sharemiService',
      // 'showClearFormButton',
      // 'showRadiologistAdvanceSearch',
      // 'showReadbackService',
      // 'showTechnicianService',
      // 'suggestTemplateService',
      // 'unibiAddress',
      // 'unirisInventory',
      // 'unirisMammoAddress',
      // 'unirisMammoService',
      // 'uniwebMammoService',
      'app_version',
      'bis_result_path',
      'bis_status_path',
      'copy_image_clipboard_service',
      'country_id',
      'doctor_consult_service',
      'doctor_schedule_address',
      'doctor_schedule_service',
      'order_block_reassign_service',
      'order_create_worklist_service',
      'order_docview_service',
      'order_edit_after_report',
      'order_flow_arrive_print',
      'order_flow_auto_refresh',
      'order_flow_auto_refresh_time',
      'order_hub_service',
      'order_lab_service',
      'order_porter_service',
      'order_validate_description_service',
      'order_validate_report_service',
      'password_length',
      'password_require_capital',
      'password_require_number',
      'print_preview_service',
      'report_attachment_service',
      'report_block_alert_service',
      'report_cache_path',
      'report_cache_service',
      'report_confirm_preview_service',
      'report_draft_alert_service',
      'report_edit_before_view_service',
      'report_editor_full_width_service',
      'report_font_path',
      'report_format_template',
      'report_hide_origital_content',
      'report_impression_service',
      'report_index_path',
      'report_index_service',
      'report_index_type',
      'report_tag_service',
      'report_verified_alert_service',
      'report_worklist_init_search',
      'sharemi_path',
      'sharemi_service',
      'show_clear_form_button',
      'show_radiologist_advance_search',
      'show_readback_service',
      'show_technician_service',
      'suggest_template_service',
      'unibi_address',
      'uniris_inventory',
      'uniris_mammo_address',
      'uniris_mammo_service',
      'uniweb_mammo_service',
      // 'show_template_description',
      // 'template_bodypart_filter',
      // 'auto_hide_template_after_use',
      // 'confirm_popup_after_verified',
      // 'custom_alert_color_service',
      // 'exam_confirm_service',
      'email_path',
      'email_service',
    ]

    // for (let i = 0; i < exceptKey.length; i++) {
    //   const camelToSnakeCase = str =>
    //     str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    //   console.log(`'${camelToSnakeCase(exceptKey[i])}',`)
    // }

    const onTop = [
      // 'auto_hide_template_after_use',
      // 'template_bodypart_filter',
      'green_dark_theme',
      // 'use_template_icon_right_side',
      // 'show_template_description',
      'hsp_id',
      'hsp_name',
      'report_header_path',
      'store_pdf_service',
      'uniris_storage',
      'uniweb_result_path',
      'unofficial_result_path',
    ]

    let newData = data.filter(d => !exceptKey.includes(d.name))
    let showTop = newData.filter(d => onTop.includes(d.name))
    let newReArrange = []

    let length = onTop.length
    let temp
    for (let i = 0; i < length; i++) {
      temp = showTop.find(s => s.name === onTop[i])
      newReArrange.push(temp)
    }

    let dataNotIncludeShowTop = newData.filter(d => !onTop.includes(d.name))
    newData = [...newReArrange, ...dataNotIncludeShowTop]

    return [newData, newData.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.updateSysProperties = async obj => {
  try {
    await updateDB(
      'RIS_SYSTEM_PROPERTIES',
      {
        SYS_VALUE: obj.value.trim(),
      },
      {
        SYS_ID: obj.id,
      }
    )

    await updateSystemPropertiesCache()
    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.deleteProtocol = async id => {
  try {
    const idArr = id.split(',')

    let length = idArr.length
    let sysId
    for (let i = 0; i < length; i++) {
      sysId = idArr[i]

      await db('RIS_PROTOCOL')
        .where({
          PROTOCOL_SYS_ID: sysId,
        })
        .del()
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.createProtocol = async obj => {
  // console.log('createProtocol', obj)
  try {
    await db('RIS_PROTOCOL').insert({
      PROTOCOL_CODE: obj.code,
      PROTOCOL_NAME: obj.name,
      PROTOCOL_TNAME: obj.tname,
      PROTOCOL_DESCRIPTION: obj.description,
      PROTOCOL_DF_STANDARD: obj.dfStandard,
      PROTOCOL_DF_BDMS: obj.dfNetwork,
      PROTOCOL_DF_GOVERNMENT: obj.dfGovernment,
      PROTOCOL_DF_INTER: obj.dfInter,
      PROTOCOL_TIME: obj.time,
      PROTOCOL_ASSIGN_SLOT: obj.weight,
      PROTOCOL_MODALITY: obj.modality,
      PROTOCOL_LOCATION: obj.locationId,
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.updateProtocol = async obj => {
  // console.log('updateProtocol', obj)
  try {
    await updateDB(
      'RIS_PROTOCOL',
      {
        PROTOCOL_CODE: obj.code,
        PROTOCOL_NAME: obj.name,
        PROTOCOL_TNAME: obj.tname,
        PROTOCOL_DESCRIPTION: obj.description,
        PROTOCOL_DF_STANDARD: obj.dfStandard,
        PROTOCOL_DF_BDMS: obj.dfNetwork,
        PROTOCOL_DF_GOVERNMENT: obj.dfGovernment,
        PROTOCOL_DF_INTER: obj.dfInter,
        PROTOCOL_TIME: obj.time,
        PROTOCOL_ASSIGN_SLOT: obj.weight,
        PROTOCOL_MODALITY: obj.modality,
        PROTOCOL_LOCATION: obj.locationId,
      },
      {
        PROTOCOL_SYS_ID: obj.sysId,
      }
    )

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getProtocol = async req => {
  const { pageNum, rowsPerPage, filter } = req.query

  const page = getPageNumForPagination(pageNum, rowsPerPage)

  function whereBuilder(b, filter) {
    if (!filter) return

    return b
      .where('PROTOCOL_CODE', 'like', `%${filter}%`)
      .orWhere('PROTOCOL_NAME', 'like', `%${filter}%`)
      .orWhere('PROTOCOL_DESCRIPTION', 'like', `%${filter}%`)
  }

  try {
    const columns = {
      sysId: 'PROTOCOL_SYS_ID',
      label: 'PROTOCOL_NAME',
      name: 'PROTOCOL_NAME',
      tname: 'PROTOCOL_TNAME',
      code: 'PROTOCOL_CODE',
      description: 'PROTOCOL_DESCRIPTION',
      modality: 'PROTOCOL_MODALITY',
      locationId: 'PROTOCOL_LOCATION',
      dfStandard: 'PROTOCOL_DF_STANDARD',
      dfNetwork: 'PROTOCOL_DF_BDMS',
      dfGovernment: 'PROTOCOL_DF_GOVERNMENT',
      dfInter: 'PROTOCOL_DF_INTER',
      time: 'PROTOCOL_TIME',
      weight: 'PROTOCOL_ASSIGN_SLOT',
    }
    const data = await db
      .select()
      .column(columns)
      .from('RIS_PROTOCOL')
      .where(builder => whereBuilder(builder, filter))
      .orderBy('PROTOCOL_CODE', 'asc')
      .limit(page.rowsPerPage)
      .offset(page.pageNum)

    const total = await db
      .select()
      .from('RIS_PROTOCOL')
      .where(builder => whereBuilder(builder, filter))

    return [data, total.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getDefaultDateAndList = async () => {
  try {
    const columns = {
      sysId: 'RIS_DATE_SYS_ID',
      defaultDate: 'RIS_DEFAULT_DATE',
      defaultList: 'RIS_DEFAULT_LIST',
    }

    const data = await db
      .select()
      .column(columns)
      .from('RIS_DEFAULT_DATE')
      .orderBy([{ column: 'RIS_DATE_SYS_ID', order: 'asc' }])
      .limit(1)

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.updateDefaultDateAndList = async obj => {
  try {
    await updateDB(
      'RIS_DEFAULT_DATE',
      {
        RIS_DEFAULT_DATE: obj.date,
        RIS_DEFAULT_LIST: obj.list,
      },
      {
        RIS_DATE_SYS_ID: obj.sysId,
      }
    )

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

async function deleteUser(userCode) {
  try {
    const userArr = userCode.split(',')

    let length = userArr.length
    let id
    for (let i = 0; i < length; i++) {
      id = userArr[i]

      await db('RIS_RADIOLOGIST')
        .where({
          RAD_CODE: id,
        })
        .del()

      await db('grouptable')
        .where({
          userid: id,
        })
        .del()

      await db('usertable')
        .where({
          userid: id,
        })
        .del()

      // await db('RIS_USER_LOCATION')
      //   .where({
      //     USER_CODE: id,
      //   })
      //   .del()
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.deleteUser = deleteUser

exports.createFeedback = async obj => {
  // console.log('createFeedback', obj)
  try {
    await db('OB_FEEDBACK').insert({
      hn: obj.hn,
      accession: obj.accession,
      feedback: obj.feedback,
      from_user: obj.fromUser,
      dttm: dayjs().format('YYYYMMDDHHmmss'),
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getFeedback = async req => {
  const { pageNum, rowsPerPage, filter } = req.query

  const page = getPageNumForPagination(pageNum, rowsPerPage)

  function whereBuilder(b, filter) {
    if (!filter) return

    return b
      .where('feedback', 'like', `%${filter}%`)
      .orWhere('from_user', 'like', `%${filter}%`)
      .orWhere('hn', 'like', `%${filter}%`)
      .orWhere('accession', 'like', `%${filter}%`)
  }

  try {
    const columns = {
      sysId: 'sys_id',
      hn: 'hn',
      accession: 'accession',
      feedback: 'feedback',
      from_user: 'from_user',
      dttm: 'dttm',
    }
    const data = await db
      .select()
      .column(columns)
      .from('OB_FEEDBACK')
      .where(builder => whereBuilder(builder, filter))
      .orderBy('dttm', 'DESC')
      .limit(page.rowsPerPage)
      .offset(page.pageNum)

    const total = await db
      .select()
      .from('OB_FEEDBACK')
      .where(builder => whereBuilder(builder, filter))

    return [data, total.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}
