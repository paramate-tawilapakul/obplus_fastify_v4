import { useState, useEffect, useContext, useMemo, createContext } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import useTheme from '@mui/material/styles/useTheme'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import createTheme from '@mui/material/styles/createTheme'
import GroupsIcon from '@mui/icons-material/Groups'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff'
// import LocationCityIcon from '@mui/icons-material/LocationCity'
import StorageIcon from '@mui/icons-material/Storage'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsIcon from '@mui/icons-material/Settings'
import RateReviewIcon from '@mui/icons-material/RateReview'
import LogoutIcon from '@mui/icons-material/Logout'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListAltIcon from '@mui/icons-material/ListAlt'
import BackupTableIcon from '@mui/icons-material/BackupTable'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import FindInPageIcon from '@mui/icons-material/FindInPage'
import LabelImportantIcon from '@mui/icons-material/LabelImportant'
// import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
// import MoveDownIcon from '@mui/icons-material/MoveDown'
import OutlinedInput from '@mui/material/OutlinedInput'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
// import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
// import AccountBoxIcon from '@mui/icons-material/AccountBox'

import DataContext from '../../context/data/dataContext'
import {
  API,
  STORAGE_NAME,
  APP_CONFIG,
  APP_ROUTES,
  idleTimeBeforeSignout,
  MODE,
  greenTheme,
  reportBgColor,
  reportFontColor,
} from '../../config'
import {
  handleErrorResponse,
  clearLocalStorage,
  blockClickBack,
} from '../../utils'

import Sidebar from './Sidebar'
import Footer from './Footer'

const ColorModeContext = createContext({ toggleColorMode: () => {} })

function DartModeBt() {
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)

  return (
    <Box>
      {/* {theme.palette.mode} mode */}
      <IconButton sx={{ mr: 0.5 }} onClick={colorMode.Layout} color='inherit'>
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon titleAccess='Switch to light' />
        ) : (
          <Brightness4Icon titleAccess='Switch to dark' />
        )}
      </IconButton>
    </Box>
  )
}

/// Local Storage Names
const systemPropertiesStorage = window.localStorage.getItem(
  STORAGE_NAME.systemProperties
)

const doctorStorage = window.localStorage.getItem(STORAGE_NAME.doctor)
// const masterTagsStorage = window.localStorage.getItem(STORAGE_NAME.masterTags)

/// Local Storage Names

export default function Layout({ children }) {
  const sTypeStorage = window.localStorage.getItem(STORAGE_NAME.stype)
  const {
    patient,
    systemProperties,
    setSystemProperties,
    doctor,
    setDoctor,
    user,
    setUser,
    // masterTags,
    // setMasterTags,
    setTheme,
    stype,
    setStudyType,
  } = useContext(DataContext)
  const history = useHistory()
  const [drawer, setDrawer] = useState(false)

  const reduceHeight = 95
  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)

  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  if (systemProperties?.greenDarkTheme === 'enable') {
    MODE['dark'] = greenTheme
    reportBgColor.dark = '#2F3742'
    reportFontColor.dark = '#f2f2f2'
  }

  let link = history.location.pathname.split('/')
  let sublink =
    link[2] === APP_ROUTES.systemConfiguration && link[3] ? `/${link[3]}` : ''

  link = link[2] + sublink

  useEffect(() => {
    let interval = setInterval(() => {
      signOut()
    }, idleTimeBeforeSignout)

    function callback() {
      clearInterval(interval)
      interval = window.setInterval(() => {
        signOut()
      }, idleTimeBeforeSignout)
    }

    document.addEventListener('mousemove', callback)
    const script = blockClickBack()
    setStudyType(sTypeStorage)

    return () => {
      clearInterval(interval)
      document.removeEventListener('mousemove', callback)
      document.body.removeChild(script)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setUpData()

    return () => {}
    // eslint-disable-next-line
  }, [user])

  async function setUpData() {
    if (!window.localStorage.getItem(STORAGE_NAME.token)) {
      window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
    }

    if (!user) {
      // window.localStorage.setItem(STORAGE_NAME.historySearchStorage, '')
      window.localStorage.setItem(STORAGE_NAME.imageHeaderStorage, '')
      window.localStorage.setItem(STORAGE_NAME.imageBase64List, '[]')

      if (!systemPropertiesStorage)
        return (window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`)
      try {
        const response = await axios.get(API.USER_DATA, {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem(
              STORAGE_NAME.token
            )}`,
          },
        })

        setUser(response.data)
      } catch (error) {
        if (error.response.status === 401) {
          window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
        } else {
          console.log(error.response)
        }
      }

      setUpAxios()
    }

    if (!systemProperties)
      setSystemProperties(JSON.parse(systemPropertiesStorage))
    if (!doctor) setDoctor(JSON.parse(doctorStorage))
    // if (!masterTags) setMasterTags(JSON.parse(masterTagsStorage))
    // if (!timeGuarantee) setTimeGuarantee(JSON.parse(timeGuaranteeStorage))
  }

  function setUpAxios() {
    axios.interceptors.response.use(
      response => {
        return response
      },
      error => {
        handleErrorResponse(error.response)
        return error
      }
    )

    axios.defaults.headers.common = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      Authorization: `Bearer ${window.localStorage.getItem(
        STORAGE_NAME.token
      )}`,
    }
  }

  async function signOut() {
    await axios.get(API.SIGN_OUT)
    clearLocalStorage()
    window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
  }

  const toggleDrawer = open => event => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }

    setDrawer(open)
  }

  const themeMode = window.localStorage.getItem(STORAGE_NAME.mode)

  const [mode, setMode] = useState(themeMode || 'light')
  /// set local storage to remember mode when refresh
  const colorMode = useMemo(
    () => ({
      Layout: () => {
        setMode(prevMode => {
          const m = prevMode === 'light' ? 'dark' : 'light'
          window.localStorage.setItem(STORAGE_NAME.mode, m)
          setTheme(m)

          return m
        })

        // fix teaching files style between dark and light mode

        if (link === APP_ROUTES.teachingFiles) {
          window.location.reload()
        }
        // fix teaching files style between dark and light mode
      },
    }),
    // eslint-disable-next-line
    []
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        typography: {
          button: {
            textTransform: 'none',
          },
        },
        tooltip: {
          background: 'transparent',
          backgroundColor: 'red',
        },
        components: {
          MuiToolbar: {
            styleOverrides: {
              dense: {
                height: 40,
                minHeight: 40,
              },
            },
          },
          MuiInputLabel: {
            defaultProps: {
              sx: {
                // fontSize: '16px',
                // mt: 0.8,
                // ml: -1.8,
              },
            },
          },
          MuiOutlinedInput: {
            defaultProps: {
              sx: {
                // fontSize: '16px',
                // mt: 0.8,
                // ml: -1.8,
              },
            },
          },
        },
      }),
    [mode]
  )

  function renderHeadNav() {
    let menu = ''
    let icon = ''
    const color = { color: 'white' }

    switch (link) {
      case APP_ROUTES.registration:
        menu = 'Registration'
        icon = <AppRegistrationIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.worklist:
        menu = 'Worklist'
        icon = <ListAltIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.patientInfo:
        menu = patient?.description
        icon = <LabelImportantIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.report:
        menu = patient?.description
        icon = <LabelImportantIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.reportTemplate:
        menu = 'Report Template'
        icon = <BackupTableIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.teachingFiles:
        menu = 'Teaching Files'
        icon = <FileCopyIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.reportSearch:
        menu = 'Report Search'
        icon = <FindInPageIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.reportTools:
        menu = 'Report Tools'
        icon = <BuildCircleIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.systemConfiguration:
        menu = 'System Configuration'
        icon = <SettingsIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.systemConfiguration + '/' + APP_ROUTES.allUser:
        menu = 'User'
        icon = <GroupsIcon fontSize='large' sx={color} />
        break
      case APP_ROUTES.systemConfiguration + '/' + APP_ROUTES.order:
        menu = 'Order'
        icon = <AssignmentIndIcon fontSize='large' sx={color} />
        break

      case APP_ROUTES.systemConfiguration + '/' + APP_ROUTES.timeGuarantee:
        menu = 'Default Date'
        icon = <HistoryToggleOffIcon fontSize='large' sx={color} />
        break

      case APP_ROUTES.systemConfiguration + '/' + APP_ROUTES.systemProperties:
        menu = 'System Properties'
        icon = <StorageIcon fontSize='large' sx={color} />
        break

      case APP_ROUTES.systemConfiguration + '/' + APP_ROUTES.feedback:
        menu = 'Feedback'
        icon = <RateReviewIcon fontSize='large' sx={color} />
        break

      default:
        break
    }

    return (
      <ListItem sx={{ ml: -2.5 }}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>
          <Typography variant='h5' sx={{ ml: -2 }}>
            {menu}
          </Typography>
        </ListItemText>
      </ListItem>
    )
  }

  return (
    <>
      {systemProperties && (
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <AppBar
              position='sticky'
              sx={{
                bgcolor: theme => MODE[theme.palette.mode].nav,
                height: 55,
              }}
            >
              <Toolbar sx={{ mt: -0.6 }}>
                <IconButton
                  size='medium'
                  edge='start'
                  color='inherit'
                  aria-label='menu'
                  sx={{
                    mr: 2,
                    // visibility: link === 'report' ? 'hidden' : 'visible',
                  }}
                  onClick={toggleDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
                {/* <div
              style={{ width: 50, height: 50, border: '1px solid #000' }}
            ></div> */}
                <div style={{ display: 'flex', flexGrow: 1 }}>
                  <div style={{ whiteSpace: 'nowrap' }}>{renderHeadNav()}</div>
                  {link === APP_ROUTES.worklist && !patient && (
                    <FormControl
                      sx={{
                        mt: 1,
                        mr: 0.5,
                        minWidth: 70,
                      }}
                      size='small'
                    >
                      <Select
                        sx={{
                          color: 'white',
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ccc',
                          },
                          '.MuiSvgIcon-root ': {
                            fill: 'white !important',
                          },
                        }}
                        variant='outlined'
                        size='small'
                        margin='dense'
                        value={stype}
                        onChange={e => {
                          setStudyType(e.target.value)
                        }}
                        input={<OutlinedInput sx={{ color: 'white' }} />}
                      >
                        <MenuItem value='all'>ALL</MenuItem>
                        <MenuItem value='1'>OB</MenuItem>
                        <MenuItem value='2'>GYN</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </div>

                <DartModeBt />

                <Typography
                  variant='subtitle1'
                  component='span'
                  sx={{ pl: 0.5, whiteSpace: 'nowrap' }}
                >
                  {user && user?.desc}
                </Typography>

                <IconButton title='Sign out' onClick={signOut}>
                  <LogoutIcon sx={{ color: 'white' }} />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Sidebar toggleDrawer={toggleDrawer} drawer={drawer} />
            <Paper
              sx={{
                height: elHeight,
                borderRadius: 0,
                width: '100%',
                overflow: 'auto',
                pt: 1,
                pb: 1,
                bgcolor: theme => MODE[theme.palette.mode].background,
              }}
            >
              {children}
            </Paper>

            <Footer hspName={systemProperties.hspName} user={user} />
          </ThemeProvider>
        </ColorModeContext.Provider>
      )}
    </>
  )
}
