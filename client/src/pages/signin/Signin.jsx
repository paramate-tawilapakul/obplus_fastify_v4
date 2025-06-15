import { useState, useContext, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import AccountCircle from '@mui/icons-material/AccountCircle'
import KeyIcon from '@mui/icons-material/Key'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import dayjs from 'dayjs'

import { API, STORAGE_NAME, APP_CONFIG, APP_ROUTES } from '../../config'
import DataContext from '../../context/data/dataContext'
import './style.css'
import logoImg from '../../assets/img/logo.png'
import { qs, qsa } from '../../utils/domUtils'
import { formDataToObject, setUpAxios } from '../../utils'

const globalWidth = 300

const inputStyle = {
  width: globalWidth,
  mb: 1,
  bgcolor: 'white',
  borderRadius: 1,
}

export default function Signin() {
  const history = useHistory()
  const {
    setSystemProperties,
    setDoctor,
    setUser,
    // setMasterTags,
    // setTimeGuarantee,
  } = useContext(DataContext)

  const [loading, setLoading] = useState(false)
  const [errMessage, setErrMessage] = useState('')

  const formRef = useRef(null)

  const [license, setLicense] = useState(false)
  const [showExpiryDate, setShowExpiryDate] = useState({
    show: false,
    date: '',
  })

  async function checkLicense() {
    try {
      const res = await axios.get(API.LICENSE)

      if (res.data.status === 200) {
        setLicense(true)
        const licenseCountdownDays = dayjs
          .unix(res.data.decoded.exp)
          .diff(dayjs(), 'days')

        const eDate = dayjs.unix(res.data.decoded.exp).format('DD-MM-YYYY')

        if (licenseCountdownDays < 15) {
          setShowExpiryDate({ show: true, date: eDate })
        }

        window.localStorage.setItem(
          'licenseCountdownDays',
          licenseCountdownDays
        )

        window.localStorage.setItem('licenseExpDate', eDate)
      } else {
        setErrMessage(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkLicense()

    return () => {}
  }, [])

  const focusInputField = parent => {
    if (parent) {
      const username = qs('input[name="username"]', parent)
      setTimeout(() => {
        username.focus()
      }, 100)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!license) return

    setLoading(true)
    setErrMessage('')

    const formData = formRef.current
    const data = qsa('input', formData)
    let form = formDataToObject(data)
    const username = form.username.trim()
    const password = form.password.trim()

    try {
      const response = await axios.post(
        API.SIGN_IN,
        {
          username,
          password,
        },
        {
          timeout: 10000,
        }
      )

      // alert(response.data.user.token)
      setUpAxios(axios, response.data.user.token)
      window.localStorage.setItem(STORAGE_NAME.token, response.data.user.token)

      await setUpData(response.data.user)
      await setUser(response.data.user)
      if (response.data.user.allowWorklist === '1') {
        history.push(`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}`)
      } else {
        alert(`You don't have permission to access any pages`)
        window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
      }
    } catch (error) {
      setLoading(false)
      setErrMessage(
        error?.response?.data?.message ||
          'Server not reponse, check network or database'
      )
    }
  }

  async function setUpData(user) {
    window.localStorage.setItem(STORAGE_NAME.currentPageNum, 1)

    if (
      !window.localStorage.getItem(STORAGE_NAME.mode) ||
      window.localStorage.getItem(STORAGE_NAME.mode) === ''
    )
      window.localStorage.setItem(STORAGE_NAME.mode, 'dark')

    window.localStorage.setItem(STORAGE_NAME.imageHeaderStorage, '')
    window.localStorage.setItem(STORAGE_NAME.stype, 'all')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTab, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData2, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData3, '')
    window.localStorage.setItem(STORAGE_NAME.isDataChange, '0')
    window.localStorage.setItem(STORAGE_NAME.isProcedureDataChange, '0')
    window.localStorage.setItem(STORAGE_NAME.diagReport, '')
    window.localStorage.setItem(STORAGE_NAME.activeFetus, '1')

    if (!window.localStorage.getItem(STORAGE_NAME.columnModel)) {
      window.localStorage.setItem(
        STORAGE_NAME.columnModel,
        `{"${APP_ROUTES.worklist}":{},"${APP_ROUTES.teachingFiles}":{}}`
      )
    }

    // if (!window.localStorage.getItem(STORAGE_NAME.editorFullWidth)) {
    //   window.localStorage.setItem(STORAGE_NAME.editorFullWidth, 'false')
    // }

    // window.localStorage.setItem(STORAGE_NAME.historySearchStorage, '')
    window.localStorage.setItem(STORAGE_NAME.imageBase64List, '[]')
    await getData(
      API.SYSTEM_PROPERTIES,
      setSystemProperties,
      STORAGE_NAME.systemProperties
    )
    await getData(API.LOCATIONS, null, STORAGE_NAME.locations, user)
    await getData(API.DOCTOR, setDoctor, STORAGE_NAME.doctor)
    // await getData(API.TAG, setMasterTags, STORAGE_NAME.masterTags)

    // await getData(
    //   API.TIME_GUARANTEE,
    //   setTimeGuarantee,
    //   STORAGE_NAME.timeGuarantee
    // )
  }

  async function getData(api, callback, storageName) {
    try {
      const response = await axios.get(api)

      window.localStorage.setItem(
        storageName,
        JSON.stringify(response.data.data)
      )

      if (callback) callback(response.data.data)
    } catch (error) {
      setErrMessage(
        error?.response?.data?.message ||
          'Server not reponse, check network or database'
      )
    }
  }

  return (
    <div
      style={{
        // width: '100%',
        height: '100vh',
        // background: '#1d1d1d',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        autoComplete='off'
        ref={formRef}
        onSubmit={!license ? () => {} : handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'white',
          backgroundColor: 'transparent',
          border: 'none',
        }}
      >
        <img src={logoImg} style={{ width: 150, marginBottom: 20 }} />
        <TextField
          disabled={!license}
          name='username'
          size='small'
          sx={inputStyle}
          placeholder='Username'
          ref={focusInputField}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <AccountCircle />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          disabled={!license}
          type='password'
          name='password'
          size='small'
          sx={inputStyle}
          placeholder='Password'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <KeyIcon />
              </InputAdornment>
            ),
          }}
        />
        <LoadingButton
          // disabled={!license}
          sx={{
            width: globalWidth,
          }}
          loading={loading}
          variant='contained'
          onClick={!license ? () => {} : handleSubmit}
          onSubmit={!license ? () => {} : handleSubmit}
        >
          SIGN IN
        </LoadingButton>
        <button style={{ display: 'none' }}>submit</button>
        {errMessage && (
          <Alert
            severity='error'
            icon={false}
            sx={{
              mt: 1,
              backgroundColor: '#ff0000',
              color: 'white',
              minWidth: globalWidth,
            }}
          >
            <div
              style={{
                width: 270,
                textAlign: 'center',
              }}
            >
              {errMessage}
            </div>
          </Alert>
        )}

        <div
          style={{
            color: '#f2f2f2',
            fontSize: 12,
            marginTop: 15,
            display: 'flex',
            // justifyContent: 'center',
            // alignContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          {showExpiryDate.show && (
            <div
              style={{
                fontSize: 14,
                color: 'yellow',
              }}
            >
              License Expiry Date: {showExpiryDate.date}
            </div>
          )}
          {APP_CONFIG.VERSION}
        </div>
      </form>
    </div>
  )
}
