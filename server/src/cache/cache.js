const { Cacheable } = require('cacheable')
const db = require('../db/config')
const { objectArrayToCamel } = require('../utils/utils')

/*
ms: Milliseconds such as (1ms = 1)
s: Seconds such as (1s = 1000)
m: Minutes such as (1m = 60000)
h or hr: Hours such as (1h = 3600000)
d: Days such as (1d = 86400000)
*/

const ttl = 86400000 // 24 hours
// const ttl = 10000 // 10 sec

const cacheable = new Cacheable()

const CacheKey = {
  MasterValue: 'MasterValue',
  MasterOption: 'MasterOption',
  SystemProperties: 'SystemProperties',
}

let masterValue, masterOption, systemProperties

exports.getMasterValueFromCache = async () => {
  try {
    masterValue = await cacheable.get(CacheKey.MasterValue)
    if (masterValue) {
      //   console.log(`${CacheKey.MasterValue}, get from cache`)
      return masterValue
    }

    // console.log(`${CacheKey.MasterValue}, get from db`)
    masterValue = await db('OB_MASTER_VALUE')
      .select()
      .column([
        { valueId: 'VALUE_ID' },
        { templateId: 'REF_TEMPLATE_ID' },
        { name: 'VALUE_NAME' },
        { display: 'VALUE_DISPLAY_CONTENT' },
        { type: 'VALUE_TYPE' },
        { unit: 'VALUE_UNIT' },
      ])
      .orderBy([
        { column: 'REF_TEMPLATE_ID', order: 'asc' },
        // { column: 'VALUE_ID', order: 'asc' },
        { column: 'VALUE_ORDER', order: 'asc' },
      ])

    await cacheable.set(CacheKey.MasterValue, masterValue, ttl)

    return masterValue
  } catch (error) {
    console.error(error)
  }
}

exports.getMasterOptionFromCache = async () => {
  try {
    masterOption = await cacheable.get(CacheKey.MasterOption)
    if (masterOption) {
      //   console.log(`${CacheKey.MasterOption}, get from cache`)
      return masterOption
    }

    // console.log(`${CacheKey.MasterOption}, get from db`)
    masterOption = await db('OB_MASTER_OPTIONS')
      .select()
      .column([
        { opId: 'OP_ID' },
        { id: 'OP_ID' },
        { opName: 'OP_NAME' },
        { name: 'OP_DISPLAY_CONTENT' },
        { label: 'OP_DISPLAY_CONTENT' },
        { display: 'OP_DISPLAY_CONTENT' },
        { valueId: 'REF_VALUE_ID' },
        { templateId: 'REF_TEMPLATE_ID' },
      ])
      .andWhere('OP_NAME', '<>', '')
      .andWhere('OP_DISPLAY_CONTENT', '<>', '')
      .orderBy([
        { column: 'REF_TEMPLATE_ID', order: 'asc' },
        // { column: 'REF_VALUE_ID', order: 'asc' },
        { column: 'OP_ORDER', order: 'asc' },
      ])

    await cacheable.set(CacheKey.MasterOption, masterOption, ttl)

    return masterOption
  } catch (error) {
    console.error(error)
  }
}

exports.getSystemPropertiesFromCache = async () => {
  try {
    systemProperties = await cacheable.get(CacheKey.SystemProperties)
    if (systemProperties) {
      //   console.log(`${CacheKey.SystemProperties}, get from cache`)
      return systemProperties
    }

    // console.log(`${CacheKey.SystemProperties}, get from db`)
    const data = await getSystemProperties()
    await cacheable.set(CacheKey.SystemProperties, data, ttl)

    return data
  } catch (error) {
    console.error(error)
  }
}

exports.updateSystemPropertiesCache = async () => {
  try {
    const data = await getSystemProperties()
    await cacheable.set(CacheKey.SystemProperties, data, ttl)
  } catch (error) {
    console.error(error)
  }
}

let sysProps
exports.getSyspropsValue = async key => {
  if (!key) return

  sysProps = await this.getSystemPropertiesFromCache()
  //   console.log('cacheable getSyspropsValue', key, sysProps[key])
  return sysProps[key]
}

async function getSystemProperties() {
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
    arrToObj['reportSearchServer'] = process.env.REPORT_SEARCH_SERVER || ''
    arrToObj['obFeedback'] = process.env.OB_FEEDBACK || ''
    arrToObj['previewAfterVerified'] = process.env.PREVIEW_AFTER_VERIFIED || ''
    arrToObj['showTabDataChecked'] = process.env.SHOW_TAB_DATA_CHECKED || ''
    arrToObj['fixLocation'] = process.env.FIX_LOCATION || ''
    arrToObj['backdropLoading'] = process.env.BACKDROP_LOADING || ''
    arrToObj['efwCharts'] = process.env.EFW_CHARTS || 'HL3'

    arrToObj = objectArrayToCamel([arrToObj])

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

    return arrToObj[0]
  } catch (error) {
    console.error(error)
  }
}
