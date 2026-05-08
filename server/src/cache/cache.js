const NodeCache = require('node-cache')
const db = require('../db/setup')
const { objectArrayToCamel, handleErrorLog } = require('../utils/utils')

const fileModule = 'cache >'

const cacheable = new NodeCache({ stdTTL: 86400 }) // 1 day in seconds

const CacheKey = {
  MasterValue: 'MasterValue',
  MasterOption: 'MasterOption',
  SystemProperties: 'SystemProperties',
}

exports.getMasterValueFromCache = async () => {
  try {
    const cached = cacheable.get(CacheKey.MasterValue)
    if (cached) {
      // console.log(`${CacheKey.MasterValue}, get from cache`)
      return cached
    }

    // console.log(`${CacheKey.MasterValue}, get from db`)
    const data = await db('OB_MASTER_VALUE')
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

    cacheable.set(CacheKey.MasterValue, data)

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getMasterValueFromCache(): ${error}`)
  }
}

exports.getMasterOptionFromCache = async () => {
  try {
    const cached = cacheable.get(CacheKey.MasterOption)
    if (cached) {
      // console.log(`${CacheKey.MasterOption}, get from cache`)
      return cached
    }

    // console.log(`${CacheKey.MasterOption}, get from db`)
    const data = await db('OB_MASTER_OPTIONS')
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

    cacheable.set(CacheKey.MasterOption, data)

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getMasterOptionFromCache(): ${error}`)
  }
}

exports.getSystemPropertiesFromCache = async () => {
  try {
    const cached = cacheable.get(CacheKey.SystemProperties)
    if (cached) {
      // console.log(`${CacheKey.SystemProperties}, get from cache`)
      return cached
    }

    // console.log(`${CacheKey.SystemProperties}, get from db`)
    const data = await getSystemProperties()
    cacheable.set(CacheKey.SystemProperties, data)

    return data
  } catch (error) {
    handleErrorLog(`${fileModule} getSystemPropertiesFromCache(): ${error}`)
  }
}

exports.updateSystemPropertiesCache = async () => {
  try {
    const data = await getSystemProperties()
    cacheable.set(CacheKey.SystemProperties, data)
  } catch (error) {
    handleErrorLog(`${fileModule} updateSystemPropertiesCache(): ${error}`)
  }
}

exports.getSyspropsValue = async key => {
  if (!key) return

  const sysProps = await exports.getSystemPropertiesFromCache()
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
    handleErrorLog(`${fileModule} getSystemProperties(): ${error}`)
  }
}
