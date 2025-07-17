import { useReducer } from 'react'
import DataContext from './dataContext'
import dataReducer from './dataReducer'

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
  SET_OPEN_REPORT,
  SET_STUDY_TYPE,
  SET_SHORTEST_CVL,
  SET_TEMPLATE_NOTIFICATION,
  SET_IS_FWHL_CHANGED,
} from '../types'

import { STORAGE_NAME } from '../../config'

const DataState = props => {
  const themeMode = window.localStorage.getItem(STORAGE_NAME.mode)

  const initialState = {
    systemProperties: null,
    doctor: null,
    // masterTags: null,
    timeGuarantee: null,
    user: null,
    patient: null,
    openReport: null,
    theme: themeMode || 'dark',
    stype: 'all',
    shortestCvl: null,
    templateNotification: null,
    isFwhlChanged: false,
  }

  const [state, dispatch] = useReducer(dataReducer, initialState)

  const setTemplateNotification = obj => {
    //console.log('setShortestCvl', obj)
    dispatch({
      type: SET_TEMPLATE_NOTIFICATION,
      payload: obj,
    })
  }

  const setShortestCvl = obj => {
    //console.log('setShortestCvl', obj)
    dispatch({
      type: SET_SHORTEST_CVL,
      payload: obj,
    })
  }

  const setIsFwhlChanged = obj => {
    //console.log('setIsFwhlChanged', obj)
    dispatch({
      type: SET_IS_FWHL_CHANGED,
      payload: obj,
    })
  }

  const setSystemProperties = obj => {
    //console.log('setSystemProperties', obj)
    dispatch({
      type: SET_SYSTEM_PROPERTIES,
      payload: obj,
    })
  }

  const setDoctor = obj => {
    dispatch({
      type: SET_DOCTOR,
      payload: obj,
    })
  }

  // const setMasterTags = obj => {
  //   dispatch({
  //     type: SET_MASTER_TAG,
  //     payload: obj,
  //   })
  // }

  const setTimeGuarantee = obj => {
    dispatch({
      type: SET_TIME_GUARANTEE,
      payload: obj,
    })
  }

  const setTheme = obj => {
    dispatch({
      type: SET_THEME,
      payload: obj,
    })
  }

  // const setFontSize = obj => {
  //   window.localStorage.setItem(STORAGE_NAME.fontSize, obj)
  //   dispatch({
  //     type: SET_FONT_SIZE,
  //     payload: obj,
  //   })
  // }

  const setStudyType = obj => {
    window.localStorage.setItem(STORAGE_NAME.stype, obj)
    dispatch({
      type: SET_STUDY_TYPE,
      payload: obj,
    })
  }

  const setUser = obj => {
    dispatch({
      type: SET_USER,
      payload: obj,
    })
  }

  const clearUser = () => {
    dispatch({
      type: CLEAR_USER,
    })
  }

  const setPatient = obj => {
    dispatch({
      type: SET_PATIENT,
      payload: obj,
    })
  }

  const setOpenReport = obj => {
    dispatch({
      type: SET_OPEN_REPORT,
      payload: obj,
    })
  }

  const clearPatient = () => {
    dispatch({
      type: CLEAR_PATIENT,
    })
  }

  return (
    <DataContext.Provider
      value={{
        systemProperties: state.systemProperties,
        doctor: state.doctor,
        timeGuarantee: state.timeGuarantee,
        user: state.user,
        patient: state.patient,
        openReport: state.openReport,
        theme: state.theme,
        // masterTags: state.masterTags,
        stype: state.stype,
        shortestCvl: state.shortestCvl,
        templateNotification: state.templateNotification,
        isFwhlChanged: state.isFwhlChanged,
        setSystemProperties,
        setDoctor,
        setTimeGuarantee,
        setUser,
        clearUser,
        setPatient,
        setOpenReport,
        clearPatient,
        setTheme,
        // setMasterTags,
        setStudyType,
        setShortestCvl,
        setTemplateNotification,
        setIsFwhlChanged,
      }}
    >
      {props.children}
    </DataContext.Provider>
  )
}

export default DataState
