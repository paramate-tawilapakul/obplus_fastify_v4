const fs = require('graceful-fs')
const dayjs = require('dayjs')

const db = require('../../db/config')
const { Logger, logFormat } = require('../../logger')
const {
  reFormatSpace,
  cleanUpContent,
  replacePwithBR,
} = require('../../utils/utils')

const writeFile = fs.promises.writeFile

exports.resetPassword = async req => {
  try {
    const { userCode } = req.body

    let password = '1234'

    if (process.env.HASH_PASSOWRD === 'YES') {
      const bcrypt = require('bcrypt')
      const saltRounds = 10
      password = await bcrypt.hash('1234', saltRounds)
    }

    for (let i = 0; i < userCode.length; i++) {
      const code = userCode[i]

      await db('usertable')
        .where({ userid: code })
        .update({ password: password })
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.changePassword = async req => {
  let { newPassword } = req.body
  const username = req.user.code

  // if (req.hashPassword.length > 30) newPassword = req.hashPassword
  if (process.env.HASH_PASSOWRD === 'YES') newPassword = req.hashPassword

  // console.log('new password', newPassword)

  try {
    await db('usertable')
      .where({ userid: username })
      .update({ password: newPassword })

    // await db('RIS_RADIOLOGIST')
    //   .where({ RAD_CODE: username })
    //   .update({ RAD_PASSWORD: newPassword })

    // Logger().info(logFormat(req, `change new password completed`))

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getUser = async username => {
  try {
    const data = await db('usertable')
      .join(
        'RIS_RADIOLOGIST',
        'usertable.userid',
        '=',
        'RIS_RADIOLOGIST.RAD_CODE'
      )
      .join(
        'RIS_USER_GROUP',
        'RIS_USER_GROUP.GR_TYPE_ID',
        '=',
        'RIS_RADIOLOGIST.RAD_TYPE'
      )
      .join(
        'RIS_PERMISSION',
        'RIS_USER_GROUP.GR_TYPE_ID',
        '=',
        'RIS_PERMISSION.ID_REF_TYPE'
      )
      .select(
        'RIS_RADIOLOGIST.RAD_SYS_ID as id',
        'RIS_RADIOLOGIST.RAD_CODE as code',
        'RIS_RADIOLOGIST.RAD_NAME as radName',
        'RIS_RADIOLOGIST.RAD_DESCRIPTION as desc',
        'RIS_RADIOLOGIST.RAD_DESCRIPTION_ENG as descEng',
        'RIS_USER_GROUP.GR_NAME as type',
        'RIS_USER_GROUP.GR_TYPE_ID as typeId',

        'RIS_PERMISSION.PM_PATIENT as allowPatientManagement',
        'RIS_PERMISSION.PM_REGISTRATION as allowRegistration',

        'RIS_PERMISSION.PM_REPORT as allowReportManagement',
        'RIS_PERMISSION.PM_RADIOLOGIST_WORKLIST as allowWorklist',
        'RIS_PERMISSION.PM_WORKLIST_ALL as allowWorklistAll',
        'RIS_PERMISSION.PM_WORKLIST_UNVERIFIED as allowWorklistUnverified',
        'RIS_PERMISSION.PM_WORKLIST_REPORTED as allowWorklistReported',

        'RIS_PERMISSION.PM_REPORT_TEMPLATE as allowReportTemplate',
        'RIS_PERMISSION.PM_TEACHING_FILES as allowTeachingFiles',
        'RIS_PERMISSION.PM_REPORT_SEARCH as allowReportSearch',

        'RIS_PERMISSION.PM_SYSTEM_CONFIG as allowSystemConfig',
        'RIS_PERMISSION.PM_USER as allowUserConfig',
        'RIS_PERMISSION.PM_USER_GROUP as allowUserGroupConfig',
        'RIS_PERMISSION.PM_ORDER as allowOrderConfig',
        'RIS_PERMISSION.PM_TIME_GUARANTEE as allowTimeguaranteeConfig',
        'RIS_PERMISSION.PM_SYSTEM_PROPERTIES as allowSystemPropertiesConfig',

        'usertable.password as hashPassword'
      )
      .where('usertable.userid', '=', username)

    if (process.env.GENERATE_INDICATION === 'YES') {
      const { capitalizeFirstLetter } = require('../utils/utils')

      let data2 = await db.raw(
        `select distinct(OB_INDICATION) from OB_STUDY where OB_INDICATION <> '' and OB_INDICATION <> ' ' and OB_STUDY_TYPE = '1'  order by OB_INDICATION asc`
      )

      data2 = data2
        .filter(d => d.OB_INDICATION && d.OB_INDICATION.trim() !== '')
        .map(d => {
          let t = d.OB_INDICATION.replace(/\s+/g, ' ')
            .replace(/,/g, ', ')
            .replace(/ , /g, ', ')
            .replace(/\s+/g, ' ')
            .trim()

          if (t.length >= 2) {
            if (t[0] === t[0].toLowerCase() && t[1] === t[1].toLowerCase()) {
              t = capitalizeFirstLetter(t)
            }

            let tArr = t?.split(', ')
            if (tArr.length > 1) {
              for (let i = 0; i < tArr.length; i++) {
                const el = tArr[i]
                if (
                  el[0] === el[0].toLowerCase() &&
                  el[1] === el[1].toLowerCase()
                ) {
                  tArr[i] = capitalizeFirstLetter(tArr[i])
                }
              }

              t = tArr.join(', ')
            }
          }

          return t
        })

      data2 = [...new Set([...data2])]
      data2 = data2.sort()

      await writeFile(
        `${process.env.PDF_BACKUP_PATH}/ob_indications.json`,
        JSON.stringify(data2)
      )

      let data3 = await db.raw(
        `select distinct(OB_INDICATION) from OB_STUDY where OB_INDICATION <> '' and OB_INDICATION <> ' ' and  OB_STUDY_TYPE = '2'  order by OB_INDICATION asc`
      )

      data3 = data3
        .filter(d => d.OB_INDICATION && d.OB_INDICATION.trim() !== '')
        .map(d => {
          let t = d.OB_INDICATION.replace(/\s+/g, ' ')
            .replace(/,/g, ', ')
            .replace(/ , /g, ', ')
            .replace(/\s+/g, ' ')
            .trim()

          if (t.length >= 2) {
            if (t[0] === t[0].toLowerCase() && t[1] === t[1].toLowerCase()) {
              t = capitalizeFirstLetter(t)
            }

            let tArr = t?.split(', ')
            if (tArr.length > 1) {
              for (let i = 0; i < tArr.length; i++) {
                const el = tArr[i]
                if (
                  el[0] === el[0].toLowerCase() &&
                  el[1] === el[1].toLowerCase()
                ) {
                  tArr[i] = capitalizeFirstLetter(tArr[i])
                }
              }

              t = tArr.join(', ')
            }
          }

          return t
        })

      data3 = [...new Set([...data3])]
      data3 = data3.sort()

      await writeFile(
        `${process.env.PDF_BACKUP_PATH}/gyn_indications.json`,
        JSON.stringify(data3)
      )
    }
    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getUserData = async code => {
  try {
    const data = await db('RIS_RADIOLOGIST')
      .join(
        'RIS_USER_GROUP',
        'RIS_USER_GROUP.GR_TYPE_ID',
        '=',
        'RIS_RADIOLOGIST.RAD_TYPE'
      )
      .join(
        'RIS_PERMISSION',
        'RIS_USER_GROUP.GR_TYPE_ID',
        '=',
        'RIS_PERMISSION.ID_REF_TYPE'
      )
      .select(
        'RIS_RADIOLOGIST.RAD_SYS_ID as id',
        'RIS_RADIOLOGIST.RAD_CODE as code',
        'RIS_RADIOLOGIST.RAD_NAME as radName',
        'RIS_RADIOLOGIST.RAD_DESCRIPTION as desc',
        'RIS_RADIOLOGIST.RAD_DESCRIPTION_ENG as descEng',
        'RIS_USER_GROUP.GR_NAME as type',
        'RIS_USER_GROUP.GR_TYPE_ID as typeId',
        'RIS_PERMISSION.PM_PATIENT as allowPatientManagement',
        'RIS_PERMISSION.PM_REGISTRATION as allowRegistration',

        'RIS_PERMISSION.PM_REPORT as allowReportManagement',
        'RIS_PERMISSION.PM_RADIOLOGIST_WORKLIST as allowWorklist',
        'RIS_PERMISSION.PM_WORKLIST_ALL as allowWorklistAll',
        'RIS_PERMISSION.PM_WORKLIST_UNVERIFIED as allowWorklistUnverified',
        'RIS_PERMISSION.PM_WORKLIST_REPORTED as allowWorklistReported',

        'RIS_PERMISSION.PM_REPORT_TEMPLATE as allowReportTemplate',
        'RIS_PERMISSION.PM_TEACHING_FILES as allowTeachingFiles',
        'RIS_PERMISSION.PM_REPORT_SEARCH as allowReportSearch',

        'RIS_PERMISSION.PM_SYSTEM_CONFIG as allowSystemConfig',
        'RIS_PERMISSION.PM_USER as allowUserConfig',
        'RIS_PERMISSION.PM_USER_GROUP as allowUserGroupConfig',
        'RIS_PERMISSION.PM_ORDER as allowOrderConfig',
        'RIS_PERMISSION.PM_TIME_GUARANTEE as allowTimeguaranteeConfig',
        'RIS_PERMISSION.PM_SYSTEM_PROPERTIES as allowSystemPropertiesConfig'
      )
      .where('RIS_RADIOLOGIST.RAD_CODE', '=', code)

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

async function getUserPassword(code) {
  try {
    const data = await db('RIS_RADIOLOGIST')
      .select('RIS_RADIOLOGIST.RAD_PASSWORD as password')
      .where('RIS_RADIOLOGIST.RAD_CODE', '=', code)

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getUserPassword = getUserPassword

exports.flagOnOff = async (id, onlineStatus) => {
  try {
    const data = await db('RIS_RADIOLOGIST')
      .where('RAD_SYS_ID', id)
      .update(
        { ONLINEL_FLAG: onlineStatus },
        ['RAD_SYS_ID', 'RAD_CODE', 'ONLINEL_FLAG'],
        {
          includeTriggerModifications: true,
        }
      )

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getRadilogistSignerName = async radName => {
  try {
    const data = await db
      .select()
      .from('RIS_RADIOLOGIST')
      .column({
        signerName: 'RAD_DESCRIPTION',
        signerNameEng: 'RAD_DESCRIPTION_ENG',
      })
      .where('RAD_NAME', radName)

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.getReportTemplate = async req => {
  try {
    const userCode = req.user.code
    const { sex } = req.query
    let data = null
    let showPublic = req.query.showPublic === 'true' ? true : false

    // if (req.query.showPublic) {
    //   showPublic = req.query.showPublic === 'true' ? true : false
    // }

    const columns = {
      id: 'TEMPLATE_SYS_ID',
      label: 'TEMPLATE_NAME',
      name: 'TEMPLATE_NAME',
      desc: 'TEMPLATE_DESC',
      content: 'TEMPLATE_CONTENT',
      owner: 'TEMPLATE_OWNER',
      type: 'TEMPLATE_TYPE',
    }

    if (sex) {
      // report management
      data = await db
        .select()
        .column(columns)
        .from('RIS_REPORT_TEMPLATE')
        .andWhere(builder => {
          builder.where('TEMPLATE_OWNER', userCode)
          if (showPublic) {
            builder.orWhere('TEMPLATE_TYPE', 'Public')
          }
        })
        .orderBy('TEMPLATE_NAME', 'asc')
      // .limit(100)
    } else {
      // report template
      if (showPublic) {
        data = await db
          .select()
          .column({ ...columns, radDesc: 'RAD_DESCRIPTION' })
          .from('RIS_REPORT_TEMPLATE')
          .leftJoin(
            'RIS_RADIOLOGIST',
            'RIS_REPORT_TEMPLATE.TEMPLATE_OWNER',
            'RIS_RADIOLOGIST.RAD_CODE'
          )
          .andWhere(builder =>
            builder
              .where('TEMPLATE_OWNER', userCode)
              .orWhere('TEMPLATE_TYPE', 'Public')
          )
          .orderBy('TEMPLATE_NAME', 'asc')
      } else {
        data = await db
          .select()
          .column(columns)
          .from('RIS_REPORT_TEMPLATE')
          .andWhere('TEMPLATE_OWNER', userCode)
          .orderBy('TEMPLATE_NAME', 'asc')
      }

      data = data.map(d => {
        return {
          ...d,
          label: `${d.name}${d.desc ? ' : ' + d.desc : ''}`,
        }
      })
    }

    let favoriteTemplate = data.filter(d => d.type === 'Favorite')
    favoriteTemplate = favoriteTemplate.map(d => ({
      ...d,
      label: d.label + ' (F)',
    }))

    if (favoriteTemplate.length > 0) {
      let newData = data.filter(d => d.type !== 'Favorite')
      newData = favoriteTemplate.concat(newData)
      data = newData
    }

    if (showPublic) {
      let publicTemplate = data.filter(d => d.type === 'Public')
      publicTemplate = publicTemplate.map(d => ({
        ...d,
        label: `${d.label} (P) by ${
          d.radDesc === 'Current Que Normal' ? 'Unknown' : d.radDesc
        }`,
      }))

      let newData = data.filter(d => d.type !== 'Public')
      newData = newData.concat(publicTemplate)

      data = newData
    }
    // console.log('**********template total', data.length)
    if (process.env.NODE_ENV !== 'production') {
      data = data.slice(0, 200)
    }
    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.updateReportTemplate = async req => {
  const userCode = req.user.code
  try {
    const {
      content,
      templateName,
      templateDesc,
      type,
      // modality,
      gender,
      id,
      bodypart,
    } = req.body

    const timestamp = dayjs().format('YYYYMMDDHHmmss')

    let newContent = content.replace(/&lt;/g, '<')
    let result = null
    const obj = {
      TEMPLATE_NAME: templateName,
      TEMPLATE_DESC: templateDesc,
      TEMPLATE_CONTENT: newContent,
      TEMPLATE_TYPE: type,
      TEMPLATE_MODALITY: '',
      TEMPLATE_BODYPART: bodypart || 'NOT DEFINED',
      TEMPLATE_SEX: gender,
    }

    if (id) {
      result = await db('RIS_REPORT_TEMPLATE')
        .where({ TEMPLATE_SYS_ID: id })
        .update(
          { ...obj, TEMPLATE_UPDATE_DATE: timestamp },
          [
            'TEMPLATE_SYS_ID',
            'TEMPLATE_NAME',
            'TEMPLATE_OWNER',
            'TEMPLATE_CREATE_BY',
            'TEMPLATE_CREATE_DATE',
            'TEMPLATE_UPDATE_DATE',
          ],
          {
            includeTriggerModifications: true,
          }
        )
    } else {
      result = await db('RIS_REPORT_TEMPLATE')
        .insert({
          ...obj,
          TEMPLATE_OWNER: userCode,
          TEMPLATE_CREATE_BY: userCode,
          TEMPLATE_CREATE_DATE: timestamp,
          TEMPLATE_UPDATE_DATE: timestamp,
        })
        .returning('*')
    }

    return result
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.deleteReportTemplate = async req => {
  const { id } = req.query

  try {
    await db('RIS_REPORT_TEMPLATE').where('TEMPLATE_SYS_ID', id).del()

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}

exports.cleanUpAllReportTemplate = async () => {
  try {
    const data = await db.raw(`
      SELECT TEMPLATE_SYS_ID as id, TEMPLATE_CONTENT as content 
      FROM RIS_REPORT_TEMPLATE
      ORDER BY TEMPLATE_NAME ASC
    `)

    console.log('all template :', data.length)
    const total = data.length
    let count = 0
    for (let i = 0; i < total; i++) {
      if (data[i].content) {
        await db('RIS_REPORT_TEMPLATE')
          .update({
            TEMPLATE_CONTENT: reFormatSpace(
              cleanUpContent(
                replacePwithBR(
                  data[i].content.replace(
                    /&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;/g,
                    '&nbsp; &nbsp; &nbsp;&nbsp;'
                  )
                )
              )
            ),
          })
          .where({ TEMPLATE_SYS_ID: data[i].id })
        count += 1
      }
    }

    console.log('template updated :', count)

    return { success: true, total: count }
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
    return false
  }
}
