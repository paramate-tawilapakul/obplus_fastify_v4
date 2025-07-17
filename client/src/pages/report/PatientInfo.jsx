import { useEffect, useContext, useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
// import orderBy from 'lodash/orderBy'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import LoadingButton from '@mui/lab/LoadingButton'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ForwardIcon from '@mui/icons-material/Forward'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Checkbox from '@mui/material/Checkbox'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'

import Layout from '../../components/layout/Layout'
import ReportNavBar from '../../components/page-tools/ReportNavBar'
import SnackBarWarning from '../../components/page-tools/SnackBarWarning'

import {
  API,
  APP_ROUTES,
  DEFAULT_DATE_STATE_INFO,
  DEFAULT_LMP_EDC,
  MODE,
  STORAGE_NAME,
} from '../../config'

import DataContext from '../../context/data/dataContext'
import { qsa } from '../../utils/domUtils'
import {
  calculateEdc,
  calculateLmp,
  // capitalizeFirstLetter,
  formDataToObject,
  reFormatDate,
  reFormatDate2,
  reFormatDateToDbFormat,
} from '../../utils'

import { inputStyle2 } from '../../components/page-tools/form-style'

import './patient-style.css'
import Feedback from '../../components/page-tools/Feedback'
import obExtIndications from '../../data/ob_indications'
import gynExtIndications from '../../data/gyn_indications'
import { manageComma } from './report-utils'
import SkeletonLoading from '../../components/page-tools/SkeletonLoading'

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />
const mr = {
  // color: theme => MODE[theme.palette.mode].dataGrid.font,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  paddingRight: '5px',
  width: 120,
  // paddingLeft: 25,
}

const inputStyle = {
  width: 240,
  ...inputStyle2,
}

let doctor = []
const PatientInfo = () => {
  const filterOptions = createFilterOptions({
    ignoreCase: true,
    matchFrom: 'any',
    limit: 100,
  })

  const history = useHistory()
  const { setPatient, patient, setIsFwhlChanged } = useContext(DataContext)
  const [date, setDate] = useState(DEFAULT_DATE_STATE_INFO)
  const [lmpEdc, setLmpEdc] = useState(DEFAULT_LMP_EDC)
  const [consultList, setConsultList] = useState([])
  const [consultSelected, setConsultSelected] = useState([])
  const [indicationSelected, setIndicationSelected] = useState([])
  const [indicationOption, setIndicationOption] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState(false)
  const formRef = useRef(null)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    severity: null,
  })

  const params = new Proxy(new URLSearchParams(history.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  let accession = params.accession

  async function getObInfo() {
    window.localStorage.setItem(STORAGE_NAME.lastActiveTab, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData2, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData3, '')
    window.localStorage.setItem(STORAGE_NAME.lastActiveTabData4, '')
    window.localStorage.setItem(STORAGE_NAME.cvl, '')
    window.localStorage.setItem(STORAGE_NAME.activeFetus, '1')
    setIsFwhlChanged(false)

    try {
      setLoading(true)

      const resPatient = await axios.get(API.PATIENT, {
        params: {
          accession,
        },
      })

      const resConsult = await axios.get(API.CONSULTANT, {
        params: {
          accession,
        },
      })

      // const resIndications = await axios.get(API.INDICATIONS)

      // console.log(resIndications.data.data)

      const consultantArr = resConsult.data.data.map(r => r.radName)
      // initData(resPatient.data.data, consultantArr, resIndications.data.data)
      initData(resPatient.data.data, consultantArr)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  function initData(patientData, consultantArr = []) {
    doctor = JSON.parse(window.localStorage.getItem(STORAGE_NAME.doctor))
    doctor = doctor.filter(d => d.radCode !== '' && d.radConsult === '1')
    // console.log(indications)
    // obIndications = orderBy(
    //   indications.filter(i => i.type === '1'),
    //   ['name'],
    //   ['asc']
    // )

    // gynIndications = orderBy(
    //   indications.filter(i => i.type === '2'),
    //   ['name'],
    //   ['asc']
    // )
    let ind = patientData?.indicationSelect?.split('|')

    let inds = ind?.length > 0 && ind[0] !== '' ? ind : []
    // console.log([...new Set([...gynExtIndications])])
    if (patientData.indication && patientData.indication?.trim() !== '') {
      if (patient?.obStudyType === '1') {
        let ifExist = obExtIndications.includes(patientData.indication?.trim())
        if (ifExist) {
          inds = [...inds, patientData.indication?.trim()]
          inds = [...new Set([...inds])]
        }
      } else if (patient?.obStudyType === '2') {
        let ifExist = gynExtIndications.includes(patientData.indication?.trim())
        if (ifExist) {
          inds = [...inds, patientData.indication?.trim()]
          inds = [...new Set([...inds])]
        }
      }
      // let newInds = patientData.indication
      //   ?.replace(/\s+/g, ' ')
      //   ?.split(',')
      //   ?.map(d => d.trim().replace(/\s+/g, ' '))
      // // ?.map(d => capitalizeFirstLetter(d.trim()))
      // inds = newInds
      // newInds = newInds?.map(d => ({
      //   id: d,
      //   name: d,
      //   type: patientData?.obStudyType,
      // }))
      // if (newInds.length > 0) {
      //   if (patientData?.obStudyType === '1') {
      //     obIndications = [...obIndications, ...newInds]
      //     obIndications = orderBy(obIndications, ['name'], ['asc'])
      //   } else {
      //     gynIndications = [...gynIndications, ...newInds]
      //     gynIndications = orderBy(gynIndications, ['name'], ['asc'])
      //   }
      // }
    }

    setIndOp(patientData?.obStudyType)
    setIndicationSelected(inds.map(i => i.replace(/&lt;/g, '<')))
    setConsultList(doctor)
    setConsultSelected(doctor.filter(d => consultantArr.includes(d.radName)))
    // setPatient({ ...patientData, currentFetus: '1' })
    setPatient(patientData)
    setLmpEdc(prev => ({
      ...prev,
      lmpGa: patientData.lmpGa,
      lmpEdc: patientData.lmpEdc,
      edcGa: patientData.edcGa,
    }))
    setDate(prev => ({
      ...prev,
      lmp: patientData.lmp ? new Date(reFormatDate2(patientData.lmp)) : null,
      edc: patientData.edc ? new Date(reFormatDate2(patientData.edc)) : null,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const formData = formRef.current
    const data = qsa('input', formData)

    let formFilters = formDataToObject(data)
    formFilters.indicationSelect = indicationSelected.join('|')
    // console.log(formFilters)

    if (!formFilters.obStudyType) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select Study Type [OB,GYN]',
        severity: 'warning',
      }))
    }
    if (
      !formFilters.indicationSelect &&
      formFilters.indication?.trim() === ''
    ) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select Indication',
        severity: 'warning',
      }))
    }

    setLoadingBtn(true)

    let fIndication = manageComma(formFilters.indication?.trim())
    let arrIndications = formFilters.indicationSelect
      ? formFilters.indicationSelect.split('|')
      : []
    // console.log(arrIndications)
    if (patient?.obStudyType === '1') {
      let ifExist = obExtIndications.find(
        ind => ind.toLowerCase() === fIndication?.toLowerCase().trim()
      )
      if (ifExist) {
        arrIndications = [...arrIndications, ifExist]
        arrIndications = [...new Set([...arrIndications])]
        fIndication = ''
      }
    } else if (patient?.obStudyType === '2') {
      let ifExist = gynExtIndications.find(
        ind => ind.toLowerCase() === fIndication?.toLowerCase().trim()
      )
      if (ifExist) {
        arrIndications = [...arrIndications, ifExist]
        arrIndications = [...new Set([...arrIndications])]
        fIndication = ''
      }
    }

    // console.log(arrIndications.join('|'))
    // console.log(fIndication)
    // return
    formFilters = {
      ...formFilters,
      noFetus: formFilters.obStudyType === '2' ? '1' : formFilters.noFetus,
      accession,
      indication: fIndication,
      indicationSelect: arrIndications.join('|'),
      consultant: consultSelected.map(c => c.radName),
      lmp: reFormatDateToDbFormat(formFilters.lmp),
      lmpGa: lmpEdc.lmpGa,
      lmpEdc: lmpEdc.lmpEdc,
      edcGa: lmpEdc.edcGa,
      edc: reFormatDateToDbFormat(formFilters.edc),
      hn: patient.hn,
    }
    // setPatient({ ...patient, ...formFilters })
    // console.log(formFilters)
    try {
      await axios.post(API.PATIENT, formFilters)

      history.push(`${APP_ROUTES.report}?accession=${patient.accession}`)
    } catch (error) {
      console.log(error)
    }
  }

  function setIndOp(type) {
    if (type === '1') {
      // let t = [
      //   ...new Set([
      //     ...obIndications.map(option => option.name),
      //     ...obExtIndications,
      //   ]),
      // ]
      // obIndications = t
      // console.log(orderBy(obIndications))
      // console.log(obExtIndications)
      setIndicationOption(obExtIndications)
    } else if (type === '2') {
      // let t = [
      //   ...new Set([
      //     ...gynIndications.map(option => option.name),
      //     ...gynExtIndications,
      //   ]),
      // ]
      // gynIndications = t
      // console.log(orderBy(gynIndications))
      // console.log(gynExtIndications)

      setIndicationOption(gynExtIndications)
    } else {
      setIndicationOption([])
    }
  }

  useEffect(() => {
    if (!accession) return history.push(`${APP_ROUTES.worklist}`)
    getObInfo()
    return () => {}
    // eslint-disable-next-line
  }, [])

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mx: { xs: 1, xl: 3 },
        }}
      >
        <ReportNavBar />
        {loading ? (
          <SkeletonLoading loading={loading} style={{ mt: 1 }} />
        ) : (
          <Fade in={patient ? true : false} timeout={200}>
            <Paper
              elevation={2}
              sx={{
                // display: 'flex',
                // justifyContent: 'space-between',
                // alignItems: 'center',
                mt: 1.4,
                p: 1,
                bgcolor: theme =>
                  theme.palette.mode === 'dark'
                    ? MODE[theme.palette.mode].tab.active
                    : '#f8f8f8',
              }}
            >
              {doctor && patient && (
                <form
                  autoComplete='off'
                  ref={formRef}
                  // onSubmit={handleSubmit}
                >
                  <input
                    type='hidden'
                    name='oldName'
                    defaultValue={patient.name}
                  />
                  <div className='patient-form-wrapper'>
                    <div className='patient-form-row'>
                      <div style={mr}>Name</div>
                      <div>
                        <TextField
                          name='name'
                          variant='outlined'
                          size='small'
                          sx={inputStyle}
                          defaultValue={patient.name}
                        />
                      </div>
                      <div style={mr}>Method</div>
                      <div>
                        <FormControl
                          sx={{
                            minWidth: 280,
                            ...inputStyle,
                          }}
                          size='small'
                        >
                          <Select
                            name='method'
                            variant='outlined'
                            margin='dense'
                            defaultValue={patient.method || ''}
                          >
                            <MenuItem value=''></MenuItem>
                            <MenuItem value='TAS'>TAS</MenuItem>
                            <MenuItem value='TVS'>TVS</MenuItem>
                            <MenuItem value='TRS'>TRS</MenuItem>
                            <MenuItem value='TAS+TVS'>TAS+TVS</MenuItem>
                            <MenuItem value='TAS+TRS'>TAS+TRS</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                      <div style={mr}>US Machine</div>
                      <div>
                        <TextField
                          name='usMachine'
                          variant='outlined'
                          size='small'
                          sx={inputStyle}
                          defaultValue={patient.usMachine}
                        />
                      </div>
                    </div>
                    <div className='patient-form-row'>
                      <div style={mr}>Study Type</div>
                      <div>
                        <FormControl
                          sx={{
                            minWidth: 240,
                            ...inputStyle,
                          }}
                          size='small'
                        >
                          <Select
                            name='obStudyType'
                            variant='outlined'
                            margin='dense'
                            onChange={e => {
                              setPatient({
                                ...patient,
                                obStudyType: e.target.value,
                              })

                              setIndOp(e.target.value)
                              setIndicationSelected([])
                            }}
                            value={patient.obStudyType || ''}
                          >
                            <MenuItem value=''></MenuItem>
                            <MenuItem value='1'>OB</MenuItem>
                            <MenuItem value='2'>GYN</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                    <div className='patient-form-row'>
                      <div style={mr}>Indication</div>
                      <div style={{ minWidth: 480 }}>
                        <Autocomplete
                          size='small'
                          fullWidth
                          multiple
                          // filterOptions={indicationOption => indicationOption}
                          filterOptions={filterOptions}
                          options={indicationOption}
                          // freeSolo
                          clearIcon={false}
                          disableCloseOnSelect
                          onChange={(e, newValue) => {
                            let temp = newValue.map(
                              n => n.trim().replace(/\s+/g, ' ')
                              // capitalizeFirstLetter(n.trim())
                            )
                            setIndicationSelected(temp)
                          }}
                          value={indicationSelected}
                          // getOptionLabel={option => `${option.radDesc}`}
                          renderOption={(props, option, { selected }) => {
                            return (
                              <li
                                {...props}
                                key={option}
                                style={{
                                  margin: 0,
                                  padding: 0,
                                  paddingLeft: 10,
                                }}
                              >
                                <Checkbox
                                  icon={icon}
                                  checkedIcon={checkedIcon}
                                  sx={{ ml: -1, mr: 1 }}
                                  checked={selected}
                                />
                                {option}
                              </li>
                            )
                          }}
                          renderTags={(tagValue, getTagProps) => {
                            return tagValue.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                variant='filled'
                                size='small'
                                key={option}
                                label={option}
                                sx={{ fontSize: 16 }}
                              />
                            ))
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              sx={{ ...inputStyle, width: 640 }}
                              fullWidth
                              variant='outlined'
                              name='indicationSelect'
                              // placeholder='Indication...'
                            />
                          )}
                          ListboxProps={{
                            style: {
                              maxHeight: '275px',
                              // border: '1px solid red'
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className='patient-form-row'>
                      <div style={{ width: 120 }}></div>
                      <div style={{ marginTop: '-1px' }}>
                        <TextField
                          placeholder='Other indication...'
                          name='indication'
                          variant='outlined'
                          size='small'
                          sx={{ ...inputStyle, width: 640 }}
                          defaultValue={patient.indication?.trim()}
                        />
                        {/* <Autocomplete
                          // clearIcon={false}
                          // disablePortal
                          name='indication'
                          defaultValue={patient.indication?.trim() || ''}
                          freeSolo
                          filterOptions={filterOptions}
                          options={indicationOption}
                          renderInput={params => (
                            <TextField
                              {...params}
                              name='indication'
                              placeholder='Other indication...'
                              variant='outlined'
                              size='small'
                              sx={{ ...inputStyle, width: 640 }}
                            />
                          )}
                        /> */}
                      </div>
                    </div>
                    <div className='patient-form-row'>
                      <div style={mr}>Consultant</div>
                      {consultList.length > 0 && (
                        <div>
                          <Autocomplete
                            multiple
                            size='small'
                            id='checkboxes-tags-demo'
                            onChange={(event, newValue) => {
                              setConsultSelected(newValue)
                            }}
                            value={consultSelected}
                            options={consultList}
                            clearIcon={false}
                            disableCloseOnSelect
                            getOptionLabel={option => `${option.radDesc}`}
                            renderOption={(props, option, { selected }) => (
                              <li
                                {...props}
                                key={option.radCode}
                                style={{
                                  margin: 0,
                                  padding: 0,
                                  paddingLeft: 10,
                                }}
                              >
                                <Checkbox
                                  icon={icon}
                                  checkedIcon={checkedIcon}
                                  sx={{ ml: -1, mr: 1 }}
                                  checked={selected}
                                />
                                {option.radDesc}
                              </li>
                            )}
                            sx={{
                              ...inputStyle,
                              width: 640,
                            }}
                            renderInput={params => <TextField {...params} />}
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <Chip
                                  {...getTagProps({ index })}
                                  key={index}
                                  variant='filled'
                                  size='small'
                                  label={option.radDesc}
                                  sx={{ fontSize: 16 }}
                                />
                              ))
                            }
                            ListboxProps={{
                              style: {
                                maxHeight: '275px',
                                // border: '1px solid red'
                              },
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {patient.obStudyType === '1' && (
                      <>
                        <div className='patient-form-row'>
                          <div style={mr}>No. Fetus</div>
                          <div>
                            <FormControl
                              sx={{
                                minWidth: 240,
                                ...inputStyle,
                              }}
                              size='small'
                            >
                              <Select
                                name='noFetus'
                                variant='outlined'
                                margin='dense'
                                defaultValue={patient.noFetus || '1'}
                              >
                                <MenuItem value='1'>1</MenuItem>
                                <MenuItem value='2'>2</MenuItem>
                                <MenuItem value='3'>3</MenuItem>
                                <MenuItem value='4'>4</MenuItem>
                              </Select>
                            </FormControl>
                          </div>
                          <div style={mr}>US GA</div>
                          <div style={{ width: 80 }}>
                            {patient.usGa && (
                              <Chip
                                label={patient.usGa}
                                sx={{
                                  bgcolor: '#767676',
                                  fontSize: 16,
                                  color: 'white',
                                }}
                              />
                            )}
                          </div>
                          <div style={mr}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Tooltip
                                title={
                                  <Typography>
                                    วันครบกำหนดคลอดจากการวัดค่าในการทำ
                                    Ultrasound
                                  </Typography>
                                }
                                placement='top-start'
                              >
                                <InfoIcon
                                  fontSize='small'
                                  sx={{ color: 'orange' }}
                                />
                              </Tooltip>
                              <div>&nbsp;US EDC</div>
                            </div>
                          </div>
                          <div style={{ width: 120 }}>
                            {patient.usEdc && (
                              <Chip
                                label={reFormatDate(patient.usEdc)}
                                sx={{
                                  bgcolor: '#767676',
                                  fontSize: 16,
                                  color: 'white',
                                }}
                              />
                            )}
                          </div>
                        </div>
                        <div className='patient-form-row'>
                          <div style={mr}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Tooltip
                                title={
                                  <Typography>
                                    วันครบกำหนดคลอดที่อายุครรภ์ 40 สัปดาห์
                                    ซึ่งคำนวนจาก LMP หรือการวัดขนาดของทารก
                                  </Typography>
                                }
                                placement='top-start'
                              >
                                <InfoIcon
                                  fontSize='small'
                                  sx={{ color: 'orange' }}
                                />
                              </Tooltip>
                              <div>&nbsp;LMP</div>
                            </div>
                          </div>
                          <div>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                slotProps={{
                                  actionBar: { actions: ['clear', 'today'] },
                                  textField: {
                                    size: 'small',
                                    name: 'lmp',
                                    sx: { ...inputStyle, width: 240 },
                                  },
                                }}
                                allowSameDateSelection
                                clearable
                                value={date.lmp}
                                format='dd/MM/yyyy'
                                onChange={newValue => {
                                  const { lmpGa, lmpEdc } =
                                    calculateLmp(newValue)

                                  setLmpEdc(prev => ({
                                    ...prev,
                                    lmpGa,
                                    lmpEdc,
                                  }))
                                  setDate(prev => ({
                                    ...prev,
                                    lmp: newValue,
                                  }))
                                }}
                              />
                            </LocalizationProvider>
                          </div>

                          <div style={mr}>LMP GA</div>
                          <div style={{ width: 80 }}>
                            {lmpEdc.lmpGa && (
                              <Chip
                                label={lmpEdc.lmpGa}
                                sx={{
                                  bgcolor: '#2185D0',
                                  fontSize: 16,
                                  color: 'white',
                                }}
                              />
                            )}
                          </div>
                          <div style={mr}>
                            {' '}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Tooltip
                                title={
                                  <Typography>
                                    วันครบกำหนดคลอดจากประจำเดือนวันแรกของครั้งสุดท้าย
                                  </Typography>
                                }
                                placement='top-start'
                              >
                                <InfoIcon
                                  fontSize='small'
                                  sx={{ color: 'orange' }}
                                />
                              </Tooltip>
                              <div>&nbsp;LMP EDC</div>
                            </div>
                          </div>
                          <div style={{ width: 120 }}>
                            {lmpEdc.lmpEdc && (
                              <Chip
                                label={reFormatDate(lmpEdc.lmpEdc)}
                                sx={{
                                  bgcolor: '#2185D0',
                                  fontSize: 16,
                                  color: 'white',
                                }}
                              />
                            )}
                          </div>
                        </div>
                        <div className='patient-form-row'>
                          <div style={mr}>EDC</div>
                          <div>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                slotProps={{
                                  actionBar: { actions: ['clear', 'today'] },
                                  textField: {
                                    size: 'small',
                                    name: 'edc',
                                    sx: { ...inputStyle, width: 240 },
                                  },
                                }}
                                allowSameDateSelection
                                clearable
                                value={date.edc}
                                format='dd/MM/yyyy'
                                onChange={newValue => {
                                  const edcGa = calculateEdc(newValue)
                                  // console.log(edcGa)
                                  setLmpEdc(prev => ({ ...prev, edcGa }))
                                  setDate(prev => ({
                                    ...prev,
                                    edc: newValue,
                                  }))
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                          <div style={mr}>EDC GA</div>
                          <div style={{ width: 80 }}>
                            {lmpEdc.edcGa && (
                              <Chip
                                label={lmpEdc.edcGa}
                                sx={{
                                  bgcolor: '#00B5AD',
                                  fontSize: 16,
                                  color: 'white',
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div
                      className='patient-form-row'
                      style={{
                        justifyContent: 'flex-end',
                        paddingRight: 10,
                        marginTop: 50,
                        marginBottom: 10,
                      }}
                    >
                      <LoadingButton
                        // type='submit'
                        onClick={handleSubmit}
                        variant='contained'
                        color='success'
                        size='large'
                        loading={loadingBtn}
                        endIcon={<ForwardIcon />}
                      >
                        Proceed
                      </LoadingButton>
                    </div>
                  </div>
                </form>
              )}
            </Paper>
          </Fade>
        )}
      </Box>
      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
      <Feedback />
    </Layout>
  )
}

export default PatientInfo
