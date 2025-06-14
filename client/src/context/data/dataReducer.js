import {
  SET_SYSTEM_PROPERTIES,
  SET_USER,
  CLEAR_USER,
  SET_PATIENT,
  CLEAR_PATIENT,
  SET_DOCTOR,
  SET_TIME_GUARANTEE,
  SET_THEME,
  // SET_MASTER_TAG,
  SET_NOTIFICATION,
  SET_OPEN_REPORT,
  SET_STUDY_TYPE,
  SET_SHORTEST_CVL,
  SET_TEMPLATE_NOTIFICATION,
  SET_IS_FWHL_CHANGED,
} from '../types'

const reducer = (state, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload }
    case CLEAR_USER:
      return { ...state, user: null }
    case SET_PATIENT:
      return { ...state, patient: action.payload }
    case SET_NOTIFICATION:
      // const page = action.payload.page
      // const data = { ...state.notification, [page]: action.payload.data }
      // console.log(page, data)
      return {
        ...state,
        notification: {
          ...state.notification,
          [action.payload.page]: action.payload.data,
        },
      }
    case CLEAR_PATIENT:
      return { ...state, patient: null }
    case SET_SYSTEM_PROPERTIES:
      return { ...state, systemProperties: action.payload }
    // case SET_MASTER_TAG:
    //   return { ...state, masterTags: action.payload }
    case SET_DOCTOR:
      return { ...state, doctor: action.payload }
    case SET_TIME_GUARANTEE:
      return { ...state, timeGuarantee: action.payload }
    case SET_THEME:
      return { ...state, theme: action.payload }
    case SET_STUDY_TYPE:
      return { ...state, stype: action.payload }
    case SET_OPEN_REPORT:
      return { ...state, openReport: action.payload }
    case SET_SHORTEST_CVL:
      return { ...state, shortestCvl: action.payload }
    case SET_TEMPLATE_NOTIFICATION:
      return { ...state, templateNotification: action.payload }
    case SET_IS_FWHL_CHANGED:
      return { ...state, isFwhlChanged: action.payload }
    default:
      return state
  }
}

export default reducer
