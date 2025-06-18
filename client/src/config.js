export const APP_CONFIG = {
  APP_NAME: 'OBPLUS',
  VERSION: 'v3.2.0',
}

export const APP_ROUTES = {
  signIn: 'signin',
  registration: 'registration',
  worklist: 'worklist',
  patientInfo: 'patient-info',
  report: 'report',
  reportSearch: 'report-search',
  reportTemplate: 'report-template',
  teachingFiles: 'teaching-files',
  systemConfiguration: 'system-configuration',
  allUser: 'all-user',
  order: 'order',
  location: 'location',
  timeGuarantee: 'time-guarantee',
  systemProperties: 'system-properties',
  feedback: 'feedback',
}

export const defaultContentStyle = `body { font-family: Tahoma;font-size: 14px; padding:0 0 0 0; width:6.70in;line-height: 1.4; zoom:1.2;}`
// export const fullWidthContentStyle = `body { font-family: Tahoma;font-size: 14px; padding:0 25px 0 25px; line-height: 1.4; zoom:1.2; }`
export const reportFontColor = { light: '#222222', dark: '#f4f4f4' }
export const reportBgColor = { light: '#eeeeee', dark: '#353535' }
export const TAB_SPACE = '&nbsp; &nbsp; &nbsp;&nbsp;'
export const ROW_HEIGHT = 36

export const MODE = {
  light: {
    patientInfo: {
      background: '#fdfdfd',
      color: '#333333',
    },
    leftTab: {
      background: '#fdfdfd',
      color: '#333333',
      selected: '#f4f4f4',
    },
    nav: '#004953',
    background: '#fffafa',
    footer: '#004953',
    dataGrid: {
      font: '#264348',
      headerBorder: '#fff3e0',
      headerBackground: '#bcdbd9',
      rowBorder: '#bcdbd9',
      rowHover: '#ffe0b2',
      checkbox: '#b7b7b7',
    },
    tab: {
      background: '#f9f9f9',
      active: {
        font: '',
        background: '#f9f9f9',
      },
      inActive: {
        font: '',
        background: '#90c4c1',
      },
      notification: {
        font: '#333',
        background: '#ffa726',
      },
      notificationInfo: {
        font: '#fff',
        background: '#63a9de',
      },
    },
    dialog: {
      header: '#bcdbd9',
      body: '#fcfcfc',
    },
    button: '#01796f',
    buttonHover: '#00544d',
    buttonReload: '#01796f',
    switch: '#01796f',
    input: '#01796f',
    useIcon: '#367588',
    buttonGroup: '#43b3ae',
    buttonGroupHover: '#3ca19c',
    buttonArrive: '#2d4535',
    buttonArriveHover: '#1e2e23',
    buttonStart: '#00a86b',
    buttonStartHover: '#009760',
    buttonEnd: '#20b2aa',
    buttonEndHover: '#1ca099',
    buttonRollback: '#96c8a2',
    buttonRollbackHover: '#87b491',
    buttonPrint: '#2d85c8',
    buttonPrintHover: '#1678C2',
    buttonPreview: '#e33a2f',
    buttonPreviewHover: '#e02518',
    buttonImage: '#547395',
    buttonImageHover: '#41648A',
    buttonPrelim: '#19D13D',
    buttonPrelimHover: '#16bc36',
    buttonVerify: '#1db01d',
    buttonVerifyHover: '#05A805',
  },
  dark: {
    nav: '#040404',
    background: '#3d3d3d',
    footer: '#040404',
    leftTab: {
      background: '#333333',
      color: '#f4f4f4',
      selected: '#353535',
    },
    patientInfo: {
      background: '',
      color: '#f4f4f4',
    },
    dataGrid: {
      font: '#f4f4f4',
      headerBorder: '#9E9E9E',
      headerBackground: '#242424',
      rowBorder: '#9E9E9E',
      rowHover: '#393939',
      checkbox: '#f4f4f4',
    },
    tab: {
      background: '#2c2c2c',
      active: {
        font: '',
        background: '#2c2c2c',
      },
      inActive: {
        font: '',
        background: '#393939',
      },
      notification: {
        font: '#000',
        background: '#ffb74d',
      },
      notificationInfo: {
        font: '#000',
        background: '#a6ceec',
      },
    },
    dialog: {
      header: '#242424',
      body: '#272727',
    },
    button: '',
    buttonHover: '',
    buttonReload: '',
    switch: '',
    input: '',
    useIcon: '',
    buttonGroup: '',
    buttonGroupHover: '',
    buttonArrive: '',
    buttonArriveHover: '',
    buttonStart: '',
    buttonStartHover: '',
    buttonEnd: '',
    buttonEndHover: '',
    buttonRollback: '',
    buttonRollbackHover: '',
  },
}

export const greenTheme = {
  nav: '',
  background: '#454D55',
  footer: '',
  leftTab: {
    background: '#333333',
    color: '#fcfcfc',
    selected: '#353535',
  },
  patientInfo: {
    background: '',
    color: '#fcfcfc',
  },
  dataGrid: {
    font: '#F2F2F2',
    headerBorder: '#9E9E9E',
    headerBackground: '#343A40',
    rowBorder: '#9E9E9E',
    rowHover: '#616161',
    checkbox: '#9E9E9E',
  },
  tab: {
    background: '#2c4a4a',
    active: {
      font: '',
      background: '#2c4a4a',
    },
    inActive: {
      font: '',
      background: '#616161',
    },
    notification: {
      font: '#000',
      background: '#ffb74d',
    },
    notificationInfo: {
      font: '#000',
      background: '#a6ceec',
    },
  },
  dialog: {
    header: '#2F3742',
    body: '#383838',
  },
  button: '',
  buttonHover: '',
  buttonReload: '',
  switch: '',
  input: '',
  useIcon: '',
  buttonGroup: '',
  buttonGroupHover: '',
  buttonArrive: '',
  buttonArriveHover: '',
  buttonStart: '',
  buttonStartHover: '',
  buttonEnd: '',
  buttonEndHover: '',
  buttonRollback: '',
  buttonRollbackHover: '',
}

export const ALL_HSP_NAME = ['RVH']

export const STORAGE_NAME = {
  mode: `${APP_CONFIG.APP_NAME}_mode`,
  systemProperties: `${APP_CONFIG.APP_NAME}_systemProperties`,
  locations: `${APP_CONFIG.APP_NAME}_locations`,
  doctor: `${APP_CONFIG.APP_NAME}_doctor`,
  // masterTags: `${APP_CONFIG.APP_NAME}_masterTags`,
  timeGuarantee: `${APP_CONFIG.APP_NAME}_timeGuarantee`,
  imageHeaderStorage: `${APP_CONFIG.APP_NAME}_reportHeaderImages64`,
  // historySearchStorage: `${APP_CONFIG.APP_NAME}_historySearchStorage`,
  imageBase64List: `${APP_CONFIG.APP_NAME}_imageBase64List`,
  token: `${APP_CONFIG.APP_NAME}_token`,
  stype: `${APP_CONFIG.APP_NAME}_stype`,
  columnModel: `${APP_CONFIG.APP_NAME}_columnModel`,
  showPublicTemplate: `${APP_CONFIG.APP_NAME}_showPublicTemplate`,
  customRowsPerPage: `${APP_CONFIG.APP_NAME}_customRowsPerPage`,
  currentPageNum: `${APP_CONFIG.APP_NAME}_currentPageNum`,
  // editorFullWidth: `${APP_CONFIG.APP_NAME}_editorFullWidth`,
  lastActiveTab: `${APP_CONFIG.APP_NAME}_lastActiveTab`,
  lastActiveTabData: `${APP_CONFIG.APP_NAME}_lastActiveTabData`,
  lastActiveTabData2: `${APP_CONFIG.APP_NAME}_lastActiveTabData2`,
  lastActiveTabData3: `${APP_CONFIG.APP_NAME}_lastActiveTabData3`,
  isDataChange: `${APP_CONFIG.APP_NAME}_isDataChange`,
  isProcedureDataChange: `${APP_CONFIG.APP_NAME}_isProcedureDataChange`,
  diagReport: `${APP_CONFIG.APP_NAME}_diagReport`,
  activeFetus: `${APP_CONFIG.APP_NAME}_activeFetus`,
  efwCharts: `${APP_CONFIG.APP_NAME}_efwCharts`,
}

export const API = {
  LICENSE: '/api/v1/user/license',
  SIGN_IN: `/api/v1/user/signin`,
  SIGN_OUT: `/api/v1/user/signout`,
  USER_DATA: `/api/v1/user`,
  CHANGE_PASSWORD: `/api/v1/user/change-password`,
  RESET_PASSWORD: `/api/v1/user/reset-password`,
  REPORT_TEMPLATE: `/api/v1/user/report-template`,

  COUNT_WORILIST: `/api/v1/worklist/count`,
  WORKLIST: `/api/v1/worklist`,
  PATIENT: `/api/v1/worklist/patient`,
  CONSULTANT: `/api/v1/worklist/consultant`,
  FAVORITE: `/api/v1/worklist/favorite`,
  TEACHING: `/api/v1/worklist/teaching-files`,

  TEACHING_FOLDER: `/api/v1/teaching/folder`,
  TEACHING_FILES: `/api/v1/teaching/files`,
  TEACHING_NOTE: `/api/v1/teaching/note`,

  REPORT_ID: `/api/v1/report/id`,
  REPORT_CONTENT: `/api/v1/report/content`,
  REPORT_ABNORMAL_CONTENT: `/api/v1/report/abnormal-content`,
  REPORT_CONTENT_VALUE: `/api/v1/report/content-value`,
  REPORT_DATA: `/api/v1/report/data`,
  REPORT_FORM: `/api/v1/report/form`,
  DIAG_REPORT: `/api/v1/report/diag`,
  AUTO_GA: `/api/v1/report/ga`,
  DICOM_IMAGE: `/api/v1/dicom-image`,
  IMAGE_BASE64: `/api/v1/report/base64`,
  PRELIM: `/api/v1/report/prelim`,
  VERIFY: `/api/v1/report/verify`,

  INIT_REPORT: `/api/v1/report/init-report`,
  PREVIEW_REPORT: `/api/v1/report/preview`,
  CHECK_PDF_BACKUP: `/api/v1/report/has-backup-report`,
  REPORT_HISTORY: `/api/v1/report/history`,
  OLD_REPORT: `/api/v1/report/old-report`,
  SERVER_TIME: `/api/v1/report/server-time`,
  EFW: `/api/v1/report/efw`,

  SYS_PROPERTIES: `/api/v1/system-data/sys-properties`,
  SYSTEM_PROPERTIES: `/api/v1/system-data/system-properties`,
  DOCTOR: `/api/v1/system-data/doctor`,
  TAG: `/api/v1/system-data/tag`,
  INDICATIONS: `/api/v1/system-data/indications`,
  LOCATIONS: `/api/v1/system-data/locations`,
  PATIENT_REGIS: `/api/v1/system-data/patient-data`,
  AVAILABLE_PROTOCOL: `/api/v1/system-data/available-protocol`,
  PROTOCOL: `/api/v1/system-data/protocol`,
  DEFAULT_DATE_LIST: `/api/v1/system-data/default-date-list`,
  FEEDBACK: `/api/v1/system-data/feedback`,

  CHECK_IS_EXIST: `/api/v1/system-data/check-is-exist`,
  PERMISSION: `/api/v1/system-data/permission`,
  USER: `/api/v1/system-data/user`,
  USER_GROUP: `/api/v1/system-data/user-group`,
  USER_BY_GROUP: `/api/v1/system-data/user-by-group`,

  PATIENT_REGISTRATION: `/api/v1/patient-data/patient-registration`,
  PATIENT_BY_HN: `/api/v1/patient-data/patient-registration`,
  CREATE_ORDER: `/api/v1/patient-data/create-order`,
  TEMPLATE_DATA: `/api/v1/patient-data/template-data`,

  INSERT_REPORT_SEARCH: `/api/v1/insert-data`,
  SEARCH_REPORT_SEARCH: `/api/v1/search-data`,

  UPLOAD: `/api/v1/files/upload`,
  UPLOAD_DICOM: `/api/v1/files/upload-dicom`,
  UPDATE_COLUMN: `/api/v1/files/update-column`,
  IMAGES: `/api/v1/files/images`,
  BACKUP_PDF: `/api/v1/files/backup-pdf`,
  EFW_CHARTS: `/api/v1/files/efw`,
}

export const FILTER_DATE_TYPE = [
  { value: 1, name: 'Order Date' },
  { value: 2, name: 'Reported Date' },
]

export const QUERY_TYPE = [
  { value: 'Match Phrase', name: 'Match Phrase' },
  { value: 'AND', name: 'AND' },
  { value: 'OR', name: 'OR' },
]

export const STUDY_TYPE = [
  { value: 'All', name: 'All' },
  { value: '1', name: 'OB' },
  { value: '2', name: 'GYN' },
]

export const DEFAULT_OPTION_STATE = {
  gender: 'All',
  room: 'All',
  modality: ['All'],
  opd: 'All',
  validateDesc: 'All',
  location: ['All'],
  priority: 'All',
  severity: 'All',
  birads: 'All',
  radiologist: null,
  status: ['All'],
  dateType: FILTER_DATE_TYPE[0].value,
  isRollback: 'no',
}

export const DEFAULT_DATE_STATE = {
  from: null,
  to: null,
  // verifiedDate: null,
}

export const DEFAULT_DATE_STATE_INFO = {
  lmp: null,
  edc: null,
  // verifiedDate: null,
}
export const DEFAULT_LMP_EDC = {
  lmpGa: '',
  lmpEdc: '',
  edcGa: '',
}

export const DEFAULT_DATA_LIST_STATE = {
  data: null,
  total: 0,
}

export const EXCEPT_COLUMNS = [
  '__check__',
  'processingNote',
  'techNote',
  'action',
  'merge',
  'orderNotes',
  'orderStat',
  'orderTech',
  'room',
  'assignTo',
  'reportBirads',
  'orderOpenStatus',
  'reportSigner',
  'reportSeverity',
  'orderItemExpectResult',
  'info',
]

export const dialogStyle = {
  position: 'absolute',
  top: 150,
}

export const reqHeader = {
  headers: {
    'Content-Type': 'application/json',
  },
}

export const defaultDialog = {
  open: false,
  title: null,
  content: null,
  minHeight: 140,
  minWidth: 400,
}

export const allowedAutoGa = [
  'GS',
  'mGS',
  'CRL',
  'BPD',
  'HC',
  'AC',
  'FL',
  'HL',
  'Radius',
  'ULNA',
  'Tibia',
  'Fibula',
]
export const FETUS_NAME = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
}

export const STUDY_NAME = {
  1: 'OB',
  2: 'GYN',
}

export const TEMPLATES = {
  ///////OB///////
  sample: { id: 5555, name: 'sample', display: 'Sample' },
  obMeasurement: { id: 1, name: 'obMeasurement', display: '2D Measurements' },
  obDoppler: { id: 2, name: 'obDoppler', display: 'Dopplers Measurements' },

  anc: { id: 4, name: 'anc', display: 'ANC Findings' },
  earlyPregnancy: {
    id: 5,
    name: 'earlyPregnancy',
    display: 'Early Pregnancy Findings',
  },
  anatomicalScan: {
    id: 6,
    name: 'anatomicalScan',
    display: 'Anatomical Scan Findings',
  },
  cervical: {
    id: 39,
    name: 'cervical',
    display: 'Cervical Length Findings',
  },
  bpp: { id: 7, name: 'bpp', display: 'BPP Findings' },
  invasive: {
    id: 8,
    name: 'invasive',
    display: 'Invasive Procedure Findings',
  },
  fetalEcho: { id: 9, name: 'fetalEcho', display: 'Fetal Echo Findings' },
  obDiagnosis: { id: 3, name: 'obDiagnosis', display: 'Sonographic Diagnosis' },

  cordAbnormal: { id: 11, name: 'cordAbnormal', display: 'Cord' },
  headShapeAbnormal: {
    id: 12,
    name: 'headShapeAbnormal',
    display: 'Head Shape',
  },
  brainAbnormal: { id: 13, name: 'brainAbnormal', display: 'Brain' },
  neckSkinAbnormal: { id: 14, name: 'neckSkinAbnormal', display: 'Neck Skin' },
  thoraxAbnormal: { id: 15, name: 'thoraxAbnormal', display: 'Thorax' },
  heartAbnormal: { id: 16, name: 'heartAbnormal', display: 'Heart' },

  cordAnatomicalAbnormal: {
    id: 17,
    name: 'cordAnatomicalAbnormal',
    display: 'Cord Anatomical',
  },
  headShapeAnatomicalAbnormal: {
    id: 18,
    name: 'headShapeAnatomicalAbnormal',
    display: 'Head Shape Anatomical',
  },
  brainAnatomicalAbnormal: {
    id: 19,
    name: 'brainAnatomicalAbnormal',
    display: 'Brain Anatomical',
  },
  neckSkinAnatomicalAbnormal: {
    id: 20,
    name: 'neckSkinAnatomicalAbnormal',
    display: 'Neck Skin Anatomical',
  },
  thoraxAnatomicalAbnormal: {
    id: 21,
    name: 'thoraxAnatomicalAbnormal',
    display: 'Thorax Anatomical',
  },
  heartAnatomicalAbnormal: {
    id: 22,
    name: 'heartAnatomicalAbnormal',
    display: 'Heart Anatomical',
  },
  spineAnatomicalAbnormal: {
    id: 23,
    name: 'spineAnatomicalAbnormal',
    display: 'Spine Anatomical',
  },
  abdomenAnatomicalAbnormal: {
    id: 24,
    name: 'abdomenAnatomicalAbnormal',
    display: 'Abdomen Anatomical',
  },
  gitAnatomicalAbnormal: {
    id: 25,
    name: 'gitAnatomicalAbnormal',
    display: 'Git Anatomical',
  },
  extremitiesAnatomicalAbnormal: {
    id: 26,
    name: 'extremitiesAnatomicalAbnormal',
    display: 'Extremities Anatomical',
  },
  skeletonAnatomicalAbnormal: {
    id: 27,
    name: 'skeletonAnatomicalAbnormal',
    display: 'Skeleton Anatomical',
  },
  kidneysAnatomicalAbnormal: {
    id: 28,
    name: 'kidneysAnatomicalAbnormal',
    display: 'Kidneys Anatomical',
  },
  genitaliaAnatomicalAbnormal: {
    id: 29,
    name: 'genitaliaAnatomicalAbnormal',
    display: 'Genitalia Anatomical',
  },
  faceAnatomicalAbnormal: {
    id: 30,
    name: 'faceAnatomicalAbnormal',
    display: 'Face Anatomical',
  },

  invasivePrerequisite: {
    id: 41,
    name: 'invasivePrerequisite',
    display: 'Invasive Procedure Findings',
  },
  invasiveAmniocentesis: {
    id: 42,
    name: 'invasiveAmniocentesis',
    display: 'Amniocentesis',
  },
  invasiveCvs: { id: 43, name: 'invasiveCvs', display: '' },
  invasiveCordocentesis: {
    id: 44,
    name: 'invasiveCordocentesis',
    display: 'Cordocentesis',
  },
  invasiveIntrauterineTranfusion: {
    id: 45,
    name: 'invasiveIntrauterineTranfusion',
    display: 'Intrauterine Tranfusion',
  },
  cardiacFunction: {
    id: 46,
    name: 'cardiacFunction',
    display: 'Cardiac Function',
  },

  ///////GYN////////
  gynMeasurement: {
    id: 31,
    name: 'gynMeasurement',
    display: '2D Measurements',
  },
  gynDoppler: { id: 32, name: 'gynDoppler', display: 'Doppler Measurements' },

  uterus: { id: 33, name: 'uterus', display: 'Uterus Findings' },
  fibroids: { id: 40, name: 'fibroids', display: 'Fibroids' },
  ovaries: { id: 34, name: 'ovaries', display: 'Ovaries Findings' },
  abnormalMass: {
    id: 35,
    name: 'abnormalMass',
    display: 'Abnormal Mass Findings',
  },
  kidneys: { id: 36, name: 'kidneys', display: 'Kidneys Bladder Findings' },
  follicleScreen: {
    id: 37,
    name: 'follicleScreen',
    display: 'Follicle Findings',
  },
  gynDiagnosis: {
    id: 38,
    name: 'gynDiagnosis',
    display: 'Gynae Cological Diagnosis',
  },

  imageReport: { id: 10, name: 'imageReport' },
}
// console.log(Object.keys(TEMPLATES).map(key => `INSERT INTO OB_MASTER_TEMPLATE (TEMPLATE_ID,TEMPLATE_NAME,TEMPLATE_STATUS,TEMPLATE_CREATE_BY) VALUES(${TEMPLATES[key].id},'${_.startCase(TEMPLATES[key].name)}','1','')`).join("\n"))
// const gynTemplateId = [31, 32, 33, 40, 34, 35, 36, 37, 38]
// console.log(
//   Object.keys(TEMPLATES).map(
//     key => !gynTemplateId.includes(TEMPLATES[key].id) && TEMPLATES[key].id
//   )
// )

export const REPORT_ID = {}

export function resetReportId() {
  window.localStorage.setItem(STORAGE_NAME.diagReport, '')

  Object.keys(REPORT_ID).forEach(key => {
    delete REPORT_ID[key]
  })
  // console.log('REPORT_ID', REPORT_ID)

  // for (const prop in REPORT_ID) {
  //   if (REPORT_ID.hasOwnProperty(prop)) {
  //     delete REPORT_ID[prop]
  //   }
  // }

  // Object.keys(REPORT_ID).forEach(key => {
  //   REPORT_ID[key] = null
  // })
  // console.log('REPORT_ID', REPORT_ID)

  Object.keys(TEMPLATES).forEach(key => {
    if (
      [
        'gynMeasurement',
        'gynDoppler',
        'uterus',
        'ovaries',
        'abnormalMass',
        'kidneys',
        'follicleScreen',
        'gynDiagnosis',
      ].includes(key)
    ) {
      REPORT_ID[key] = { 1: null }
    } else {
      REPORT_ID[key] = { 1: null, 2: null, 3: null, 4: null }
    }
  })

  // console.log('REPORT_ID', REPORT_ID)
}

resetReportId()

export const EFW_CHARTS = {
  HL: 29,
  SP: 30,
  HL3: 31,
}

// 60 * 1000 = 1 minute
export const worklistIntervalRefresh = 30 * 1000 // 30 seconds
export const idleTimeBeforeSignout = 60 * 60 * 1000 // 60 minutes
