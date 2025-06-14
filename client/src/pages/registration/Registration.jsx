import { useEffect, useContext, useState, useRef } from 'react'
import axios from 'axios'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { Button, Paper, Stack, Box } from '@mui/material'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import Checkbox from '@mui/material/Checkbox'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import LoadingButton from '@mui/lab/LoadingButton'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SaveIcon from '@mui/icons-material/Save'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { makeStyles } from '@mui/styles'

import DataContext from '../../context/data/dataContext'
import Layout from '../../components/layout/Layout'
import { checkLogin, formDataToObject, hasPermission, sleep } from '../../utils'
import SnackBarWarning from '../../components/page-tools/SnackBarWarning'
import { API, MODE, reqHeader, STORAGE_NAME } from '../../config'
import { qsa } from '../../utils/domUtils'
import { inputStyle2, btStyle } from '../../components/page-tools/form-style'

let timeoutSearchProtocol = null
let inputRef

const inputWidth = 320
const inputMt = 1.5

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />
const defaultSelected = {
  accession: '',
  location: '',
  protocol: [],
}

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0.5, m: 0 }}>{children}</Box>}
    </div>
  )
}

const useStyles = makeStyles({
  tab: {
    '& .Mui-selected': {
      fontSize: '18px',
    },
  },
})

const Registration = () => {
  const locations = JSON.parse(
    window.localStorage.getItem(STORAGE_NAME.locations)
  )
  const { user, systemProperties } = useContext(DataContext)
  const [tabSelected, setTabSelected] = useState('createOrder')
  const classes = useStyles()
  const [patient, setPatient] = useState(null)
  const [hnState, setHnState] = useState('')
  const [loading, setLoading] = useState(false)
  const [dob, setDob] = useState(null)
  const [showSendData, setShowSendData] = useState(false)
  const [selected, setSelected] = useState(defaultSelected)
  const [gender, setGender] = useState('F')
  const [filter, setFilter] = useState('')
  const [availableProtocol, setAvailableProtocol] = useState([])
  const formRegisterRef = useRef(null)
  const history = useHistory()
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 2000,
  })

  const handleChangeTab = (event, tabSelected) => {
    resetForm()
    setTabSelected(tabSelected)
  }

  useEffect(() => {
    checkLogin()
    if (user) {
      hasPermission('allowRegistration', history, user)
    }
    return () => {}
    // eslint-disable-next-line
  }, [user])

  function resetForm(t = 'all') {
    setSelected(defaultSelected)
    if (t === 'all') {
      setHnState('')
      formRegisterRef?.current?.reset()
    }
    setShowSendData(false)
    setAvailableProtocol([])
    setPatient(null)
    setFilter('')
    setDob(null)
    setGender('F')
    setLoading(false)
  }

  function resetRegisterForm() {
    formRegisterRef?.current?.reset()
    setDob(null)
    setGender('F')
  }

  async function submitRegister(e, type) {
    e?.preventDefault()
    const formData = formRegisterRef.current
    const data = qsa('input', formData)
    let form = formDataToObject(data)
    const hn = form.hn.trim().toLowerCase()
    const nameTh = form.nameTh.trim().toLowerCase()
    const dob = form.dob.trim().toLowerCase()
    if (!hn) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `HN is required`,
        severity: 'warning',
      }))
    }
    if (!nameTh) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `Name Th is required`,
        severity: 'warning',
      }))
    }
    if (!dob) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `Birth Date is required`,
        severity: 'warning',
      }))
    }

    // console.log(form)

    const res = await axios.post(API.PATIENT_BY_HN, { data: form })
    if (res.data.data.success === 'exist') {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `HN ${hn} already exist!`,
        severity: 'warning',
      }))
    }

    resetRegisterForm()
    if (type === 'createOrder') {
      setTabSelected('createOrder')
      submit(null, hn)
    } else {
      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `Save completed`,
        severity: 'success',
      }))
    }
  }

  async function submit(e, hnFromRegister) {
    // console.log('hnFromRegister', hnFromRegister)
    try {
      e?.preventDefault()
      let hn
      if (hnFromRegister) {
        hn = hnFromRegister
        setHnState(hn)
      } else {
        hn = hnState
      }

      if (!hn) {
        return
      }

      const res = await axios.get(API.PATIENT_REGIS, { params: { hn } })
      if (res.data.data.length > 0) {
        setShowSendData(true)
        setPatient(res.data.data[0])
        getAccessionNo()
      } else {
        // setShowSendData(false)
        // setPatient(null)
        resetForm('exclude hn')
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'HN not found',
          severity: 'warning',
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  function getAccessionNo() {
    setSelected(prev => ({
      ...prev,
      accession:
        (systemProperties.hspId || 'ACC') + moment().format('YYYYMMDDHHmmss'),
    }))
  }

  async function createOrder() {
    if (!selected.location) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select Order Location',
        severity: 'warning',
      }))
    }

    if (!selected.protocol || selected.protocol.length === 0) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select Protocol',
        severity: 'warning',
      }))
    }
    setLoading(true)

    sleep(50).then(async () => {
      try {
        const [id, code] = selected.location.split(':')

        const newPatient = {}
        Object.keys(patient).forEach(k => {
          if (['name', 'nameEn'].includes(k)) {
            newPatient[k] = patient[k]?.replace(/  +/g, ' ')
          } else {
            newPatient[k] = patient[k]
          }
        })
        const body = {
          patient: newPatient,
          accession: selected.accession,
          locationId: id,
          locationCode: code,
          protocol: selected.protocol,
        }

        const res = await axios.post(API.CREATE_ORDER, body, reqHeader)
        if (res.data.data.success) {
          setSnackWarning(prev => ({
            ...prev,
            show: true,
            message: 'Create Order Completed',
            severity: 'success',
          }))
        } else {
          setSnackWarning(prev => ({
            ...prev,
            show: true,
            message: 'Create Order Fail',
            severity: 'error',
          }))
        }
        resetForm()
      } catch (error) {
        console.log(error)
      }
    })
  }

  async function searchProtocol(f) {
    try {
      setAvailableProtocol([])
      setSelected(prev => ({ ...prev, protocol: [] }))

      const res = await axios.get(API.AVAILABLE_PROTOCOL, {
        params: {
          filter: f,
        },
      })

      if (res.data.data.length > 0) {
        setAvailableProtocol(res.data.data)
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: `Found ${res.data.data.length} protocol${
            res.data.data.length === 1 ? '' : 's'
          }`,
          severity: 'success',
        }))
        inputRef.focus()
      } else {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Protocol not found',
          severity: 'warning',
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Layout>
      <Stack direction='column' alignItems='center'>
        <Paper
          elevation={4}
          sx={{
            mx: 1,
            width: 1000,
            maxWidth: '70%',
            // maxWidth: 1000,
            // minWidth: 700,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              bgcolor: theme =>
                MODE[theme.palette.mode].tab.inActive.background,
              justifyContent: 'flex-start',
            }}
          >
            <Tabs
              className={classes.tab}
              value={tabSelected}
              onChange={handleChangeTab}
              sx={{
                '& .Mui-selected': {
                  color: theme => MODE[theme.palette.mode].tab.active.font,
                  bgcolor: theme =>
                    MODE[theme.palette.mode].tab.active.background,
                },
                '.MuiTabs-indicator': {
                  bgcolor: theme =>
                    MODE[theme.palette.mode].tab.active.background,
                },
                '& .MuiTab-root:hover': {
                  color: theme => MODE[theme.palette.mode].dataGrid.font,
                },
              }}
            >
              <Tab
                disableRipple
                sx={{
                  textTransform: 'none',
                  minWidth: 45,
                  px: 2,
                }}
                label='Create Order'
                value='createOrder'
              />
              <Tab
                disableRipple
                sx={{
                  textTransform: 'none',
                  minWidth: 45,
                  px: 2,
                }}
                label='Register'
                value='register'
              />
            </Tabs>
          </Box>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              borderRadius: 0,
              pt: 0.5,
              pb: 1,
              bgcolor: theme => MODE[theme.palette.mode].tab.background,
            }}
          >
            <TabPanel value={tabSelected} index='createOrder'>
              <form
                // ref={formCreateOrderRef}
                autoComplete='off'
                onSubmit={submit}
                style={{
                  width: '100%',
                  display: 'flex',
                }}
              >
                <TextField
                  autoComplete='off'
                  label='HN'
                  variant='outlined'
                  size='small'
                  margin='dense'
                  name='hn'
                  value={hnState}
                  onChange={e => setHnState(e.target.value)}
                  autoFocus
                  sx={{ ...inputStyle2, width: inputWidth, ml: 1 }}
                  InputProps={{
                    // placeholder: 'HN...',
                    endAdornment: (
                      <InputAdornment
                        sx={{ cursor: 'pointer', mr: -1 }}
                        position='end'
                        onClick={submit}
                      >
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button type='submit' style={{ display: 'none' }}>
                  Search
                </Button>
              </form>
              {showSendData && (
                <div
                  style={{
                    marginTop: 0,
                    padding: '0 7px 0 7px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    // alignItems: 'center',
                  }}
                >
                  <TextField
                    autoComplete='off'
                    label='Name'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    InputLabelProps={{ shrink: true }}
                    sx={{ ...inputStyle2, width: inputWidth, mt: inputMt }}
                    InputProps={{
                      readOnly: true,
                    }}
                    value={patient?.name?.replace(/  +/g, ' ') || ''}
                  />
                  <TextField
                    autoComplete='off'
                    value={selected.accession}
                    label='Accession No.'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    sx={{ ...inputStyle2, width: inputWidth, mt: inputMt }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment
                          sx={{ cursor: 'pointer', mr: -1 }}
                          position='end'
                          onClick={getAccessionNo}
                        >
                          <AddCircleOutlineIcon titleAccess='Get Accession No.' />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl
                    sx={{ ...inputStyle2, width: inputWidth, mt: inputMt }}
                    size='small'
                  >
                    <InputLabel>Order Location *</InputLabel>
                    <Select
                      label='Order Location'
                      required
                      name='location'
                      value={selected.location}
                      onChange={e =>
                        setSelected(prev => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    >
                      {locations.map(
                        l =>
                          l.name !== 'ALL' && (
                            <MenuItem key={l.id} value={l.id + ':' + l.code}>
                              {l.code}
                            </MenuItem>
                          )
                      )}
                    </Select>
                  </FormControl>

                  <TextField
                    autoComplete='off'
                    label='Search Protocols'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    value={filter}
                    sx={{ ...inputStyle2, width: inputWidth, mt: 2 }}
                    InputLabelProps={{ shrink: true }}
                    onChange={e => {
                      clearTimeout(timeoutSearchProtocol)
                      let f = e.target.value

                      if (!f) setAvailableProtocol([])

                      if (f !== '') {
                        timeoutSearchProtocol = setTimeout(() => {
                          searchProtocol(f.trim())
                        }, 1000)
                      }
                      setFilter(f)
                    }}
                    onKeyDown={() => {
                      // if (e.key === 'Enter') {
                      //   if (e.target.value.trim() !== '') searchProtocol()
                      // }
                    }}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment
                    //       sx={{ cursor: 'pointer', mr: -1 }}
                    //       position='end'
                    //       onClick={() => {
                    //         if (filter.trim() !== '') searchProtocol()
                    //       }}
                    //     >
                    //       <SearchIcon />
                    //     </InputAdornment>
                    //   ),
                    // }}
                  />

                  {/* {availableProtocol.length > 0 && ( */}
                  <Autocomplete
                    sx={{
                      mt: inputMt,
                    }}
                    multiple
                    // size='small'
                    onChange={(event, newValue) => {
                      setSelected(prev => ({
                        ...prev,
                        protocol: newValue,
                      }))
                    }}
                    openOnFocus
                    options={availableProtocol}
                    disableCloseOnSelect
                    getOptionLabel={option => `${option.code}:${option.name}`}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.code}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          sx={{ ml: -1, mr: 1, p: 0 }}
                          checked={selected}
                        />
                        {option.code}:{option.name}
                      </li>
                    )}
                    style={{ width: '100%' }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        sx={{ ...inputStyle2 }}
                        label='Available Protocols'
                        // focused={focusAvailableProtocol}
                        autoComplete='off'
                        inputRef={input => {
                          inputRef = input
                        }}
                      />
                    )}
                  />
                  {/* )} */}

                  {/* {availableProtocol.length > 0 && ( */}
                  <LoadingButton
                    sx={{ ...btStyle, mt: 2, width: 195 }}
                    loading={loading}
                    variant='contained'
                    size='large'
                    color='primary'
                    onClick={createOrder}
                    startIcon={<AssignmentTurnedInIcon />}
                  >
                    Send to Worklist
                  </LoadingButton>
                  {/* )} */}
                </div>
              )}
            </TabPanel>
            <TabPanel value={tabSelected} index='register'>
              <form
                autoComplete='off'
                ref={formRegisterRef}
                onSubmit={e => submitRegister(e, 'register')}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 0,
                  padding: '0 7px 0 7px',
                }}
              >
                <TextField
                  autoComplete='off'
                  label='HN'
                  required
                  variant='outlined'
                  size='small'
                  margin='dense'
                  name='hn'
                  autoFocus
                  sx={{ ...inputStyle2, width: inputWidth }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  // InputProps={{
                  //   endAdornment: radioValue === 'edit' && (
                  //     <InputAdornment
                  //       sx={{ cursor: 'pointer', mr: -1 }}
                  //       position='end'
                  //       onClick={submitRegister}
                  //     >
                  //       <SearchIcon />
                  //     </InputAdornment>
                  //   ),
                  // }}
                />

                <TextField
                  autoComplete='off'
                  label='Name Th'
                  required
                  variant='outlined'
                  size='small'
                  margin='dense'
                  name='nameTh'
                  sx={{ ...inputStyle2, width: inputWidth, mt: inputMt }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  autoComplete='off'
                  label='Name En'
                  variant='outlined'
                  size='small'
                  margin='dense'
                  name='nameEn'
                  sx={{ ...inputStyle2, width: inputWidth, mt: inputMt }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  autoComplete='off'
                  label='Allergy'
                  variant='outlined'
                  size='small'
                  margin='dense'
                  name='allergy'
                  sx={{ ...inputStyle2, width: inputWidth, mt: inputMt }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FormControl
                  sx={{ ...inputStyle2, width: 180, mt: inputMt }}
                  size='small'
                >
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    label='Gender'
                    required
                    name='gender'
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    {/* <MenuItem value='M'>Male</MenuItem> */}
                    <MenuItem value='F'>Female</MenuItem>
                  </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    slotProps={{
                      actionBar: { actions: ['clear', 'today'] },
                      textField: {
                        size: 'small',
                        name: 'dob',
                        sx: { ...inputStyle2, mt: 2, width: 180 },
                        InputLabelProps: {
                          shrink: true,
                        },
                        required: true,
                      },
                    }}
                    allowSameDateSelection
                    clearable
                    label='Birth Date'
                    value={dob}
                    format='dd/MM/yyyy'
                    onChange={newValue => setDob(newValue)}
                  />
                </LocalizationProvider>

                <div>
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    sx={{
                      ...btStyle,
                      mt: 2,
                      mr: 1,
                      // width: 90,
                      // display: !showForm && 'none',
                    }}
                    startIcon={<SaveAsIcon />}
                    onClick={e => submitRegister(e, 'createOrder')}
                  >
                    Save & Create Order
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    color='secondary'
                    sx={{
                      ...btStyle,
                      mt: 2,
                      width: 90,
                      // display: !showForm && 'none',
                    }}
                    startIcon={<SaveIcon />}
                    onClick={e => submitRegister(e, 'register')}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </TabPanel>
          </Paper>
        </Paper>
      </Stack>

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </Layout>
  )
}

export default Registration
