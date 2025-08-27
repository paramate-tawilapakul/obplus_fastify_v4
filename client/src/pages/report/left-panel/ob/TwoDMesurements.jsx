import { useContext, useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import useTheme from '@mui/material/styles/useTheme'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import Divider from '@mui/material/Divider'
import { orange } from '@mui/material/colors'

import {
  API,
  MODE,
  TEMPLATES,
  REPORT_ID,
  reqHeader,
  EFW_CHARTS,
  allowedAutoGa,
  STORAGE_NAME,
} from '../../../../config'
import {
  btStyle,
  inputStyle,
} from '../../../../components/page-tools/form-style'
import { reFormatDate, sleep } from '../../../../utils'
import {
  autoSave4,
  checkNumber,
  cleanUpForm,
  getReportId,
  getRiD,
  newGa,
  randomMs,
  updateMesurementDataChange,
} from '../../helper'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import DataContext from '../../../../context/data/dataContext'
import { initFormSend, storeBackupData5 } from '../../report-utils'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const chipStyle = {
  ml: 1,
  fontSize: 16,
  color: 'white',
}

const boxStyle = {
  ml: 0.5,
  // pl: 0.5,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
}

const templateId = TEMPLATES.obMeasurement.id

let backupData = null

const TwoDMesurements = ({ patient }) => {
  const { setShortestCvl, setIsFwhlChanged, systemProperties } =
    useContext(DataContext)
  const theme = useTheme()
  // console.log('render TwoDMesurements OB')
  const [showEditForm, setShowEditForm] = useState(false)
  const [dataInfo, setDataInfo] = useState(patient)
  const [mesurement, setMesurement] = useState([])
  const [loadingMes, setLoadingMes] = useState(false)
  // const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState(null)
  const [defaultDataFormSend, setDefaultDataFormSend] = useState(null)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: null,
  })

  // const [data, setData] = useState(patient)

  useEffect(() => {
    resetData()
    initData()

    return () => {
      autoSave4(backupData)
      backupData = null
    }
    // eslint-disable-next-line
  }, [patient])

  function resetData() {
    setShowEditForm(false)
    setMesurement([])
    setDataForm([])
  }

  function initData() {
    try {
      setLoadingMes(true)
      const rand = randomMs()
      sleep(rand).then(async () => {
        if (!REPORT_ID[TEMPLATES.obMeasurement.name][patient.currentFetus]) {
          // console.log('******getReportId()', rand)
          const id = await getReportId(
            patient.accession,
            patient.currentFetus,
            templateId
          )

          REPORT_ID[TEMPLATES.obMeasurement.name][patient.currentFetus] = id
        }

        setDataInfo(patient)
        fetchMesurement()
      })
    } catch (error) {
      console.log(error)
    }
  }

  // async function getCvlReportId() {
  //   try {
  //     if (!REPORT_ID[TEMPLATES.cervical.name][patient.currentFetus]) {
  //       // console.log('******getReportId()', rand)
  //       const id = await getReportId(
  //         patient.accession,
  //         patient.currentFetus,
  //         TEMPLATES.cervical.id
  //       )

  //       REPORT_ID[TEMPLATES.cervical.name][patient.currentFetus] = id
  //       return id
  //     } else {
  //       return REPORT_ID[TEMPLATES.cervical.name][patient.currentFetus]
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  async function fetchMesurement() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.obMeasurement.name, patient.currentFetus),
        },
      })

      await updateShortestCvl(res.data.data)

      setMesurement(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function updateShortestCvl(data) {
    try {
      // let findCvl = data.filter(d =>
      //   ['CVL (X)', 'CVL (Y)', 'CVL (Z)'].includes(d.contentValueName)
      // )
      let findCvl = data.filter(d => ['CVL'].includes(d.contentValueName))
      // console.log(findCvl)
      let shortest = findCvl[0]?.content || ''

      // console.log(cvlReportId)
      if (findCvl.length > 0) {
        // const cvlReportId = await getCvlReportId()
        // console.log('updateShortestCvl')
        // shortest = Math.min(...findCvl.map(cvl => cvl.content))
        // await axios.post(
        //   API.REPORT_CONTENT_VALUE,
        //   {
        //     reportId: cvlReportId,
        //     value: shortest,
        //     name: 'TVS Cervical Length',
        //   },
        //   reqHeader
        // )
      } else {
        // console.log('no cvl')
      }

      if (shortest) {
        setShortestCvl(shortest)
        // window.localStorage.setItem(STORAGE_NAME.isCvlDataChange, '1')
        window.localStorage.setItem(STORAGE_NAME.cvl, shortest)
      } else {
        // window.localStorage.setItem(STORAGE_NAME.isCvlDataChange, '1')
        window.localStorage.setItem(STORAGE_NAME.cvl, '')
        setShortestCvl('')
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.obMeasurement.name, patient.currentFetus),
      templateId,
      true
    )

    setDataFormSend(formSend)
    setDefaultDataFormSend(formSend)
    backupData = formSend
    storeBackupData5(formSend)

    setDataForm(form)
    setLoadingMes(false)
  }

  async function fetchObInfo() {
    try {
      const resPatient = await axios.get(API.PATIENT, {
        params: {
          accession: patient.accession,
        },
      })

      setDataInfo({ ...patient, ...resPatient.data.data })
    } catch (error) {
      console.log(error)
    }
  }

  function handleEditClick() {
    setShowEditForm(true)
  }

  async function handleSaveClick() {
    try {
      setShowEditForm(false)

      let newForm = cleanUpForm(dataFormSend)

      // console.log(newForm)
      if (newForm['1899']?.value) {
        window.localStorage.setItem(STORAGE_NAME.isCvlDataChange, '1')
        window.localStorage.setItem(STORAGE_NAME.cvl, newForm['1899'].value)
      } else {
        window.localStorage.setItem(STORAGE_NAME.isCvlDataChange, '1')
        window.localStorage.setItem(STORAGE_NAME.cvl, '')
      }

      const res = await axios.post(
        API.REPORT_CONTENT,
        { reportData: newForm },
        reqHeader
      )
      if (res.data.data) {
        updateMesurementDataChange('0')
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save Completed',
          severity: 'success',
        }))
        setLoadingMes(true)

        let targetEfw = EFW_CHARTS[systemProperties?.efwCharts || 'HL3']

        const fwhl = mesurement.find(item => item.refValueId === targetEfw)

        if (fwhl?.content) {
          if (newForm[targetEfw] && fwhl) {
            if (fwhl.content !== newForm[targetEfw].value) {
              // console.log('FW(HL) changed1')
              setIsFwhlChanged(true)
            }
          }
        }

        if (!fwhl && newForm[targetEfw]) {
          // console.log('FW(HL) changed2')
          setIsFwhlChanged(true)
        }

        if (fwhl && !newForm[targetEfw]) {
          // console.log('FW(HL) deleted, remove efw charts')
          await axios.delete(API.EFW_CHARTS, {
            params: {
              accession: patient.accession,
              fetusNo: patient.currentFetus,
            },
          })

          setIsFwhlChanged(true)
        }

        await fetchMesurement()
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleAutoGa(e, form) {
    try {
      if (!checkNumber(e.target.value))
        return setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Only number',
          severity: 'warning',
        }))

      const res = await axios.get(API.AUTO_GA, {
        params: { name: form.name },
      })

      const masterGa = res.data.data.map(d => {
        let newObj = {}
        newObj['val'] = d[form.name]
        if (d.days) {
          newObj['days'] = d.days
        }
        if (d.weeks) {
          newObj['weeks'] = d.weeks
        }
        return newObj
      })

      newGa(form.name, e.target.value, masterGa, callBack, setSnackWarning)

      function callBack(ga) {
        setDataFormSend(prev => ({
          ...prev,
          [form.valueId]: {
            ...prev[form.valueId],
            value: e.target.value + '#' + ga,
          },
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  function resetForm() {
    updateMesurementDataChange('0')
    backupData = defaultDataFormSend
    storeBackupData5(defaultDataFormSend)
    setDataFormSend(defaultDataFormSend)
    setShowEditForm(false)
  }

  return (
    <>
      {patient && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          {!showEditForm && (
            <Box
              sx={{
                width: '100%',
                position: 'sticky',
                top: -4,
                bgcolor: theme => MODE[theme.palette.mode].tab.active,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  alignContent: 'center',
                  paddingLeft: 5,
                }}
              >
                <IconButton
                  title='Reload'
                  onClick={async () => {
                    await fetchObInfo()
                    initData()
                  }}
                  sx={{
                    color: theme => MODE[theme.palette.mode].buttonReload,
                    mr: 0.5,
                  }}
                  aria-label='reload'
                  component='span'
                >
                  <RefreshIcon />
                </IconButton>
                <Button
                  variant='contained'
                  startIcon={<EditIcon />}
                  size='small'
                  sx={{ ...btStyle }}
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
              </div>
            </Box>
          )}
          {showEditForm && (
            <Box
              sx={{
                width: '100%',
                position: 'sticky',
                top: -4,
                zIndex: 500,
                bgcolor: theme => MODE[theme.palette.mode].tab.active,
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  paddingLeft: 5,
                  paddingTop: 5,
                  // paddingBottom: 8,
                }}
              >
                <Button
                  variant='outlined'
                  size='small'
                  sx={{ mr: 1 }}
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  startIcon={<CheckIcon />}
                  size='small'
                  sx={{ ...btStyle }}
                  onClick={handleSaveClick}
                >
                  Save
                </Button>
              </div>
            </Box>
          )}
          <Box sx={{ ...boxStyle, pl: 1 }}>
            {(dataInfo.lmpEdc || dataInfo.lmpGa) && (
              <Typography component='div' variant='body1' sx={{ mt: 1 }}>
                LMP:
                {dataInfo.lmpGa && (
                  <Chip
                    label={`GA ${dataInfo.lmpGa}`}
                    sx={{
                      ...chipStyle,
                      bgcolor: '#2185D0',
                    }}
                  />
                )}
                {dataInfo.lmpEdc && (
                  <Chip
                    label={`EDC ${reFormatDate(dataInfo.lmpEdc)}`}
                    sx={{
                      ...chipStyle,
                      bgcolor: '#2185D0',
                    }}
                  />
                )}
              </Typography>
            )}
            {(dataInfo.edc || dataInfo.edcGa) && (
              <Typography component='div' variant='body1' sx={{ mt: 1 }}>
                EDC:
                {dataInfo.edcGa && (
                  <Chip
                    label={`GA ${dataInfo.edcGa}`}
                    sx={{
                      ...chipStyle,
                      bgcolor: '#00B5AD',
                    }}
                  />
                )}
                {dataInfo.edc && (
                  <Chip
                    label={`EDC ${reFormatDate(dataInfo.edc)}`}
                    sx={{
                      ...chipStyle,
                      bgcolor: '#00B5AD',
                    }}
                  />
                )}
              </Typography>
            )}
            {(dataInfo.usEdc || dataInfo.usGa) && (
              <Typography component='div' variant='body1' sx={{ mt: 1 }}>
                US: &nbsp;&nbsp;
                {dataInfo.usGa && (
                  <Chip
                    label={`GA ${dataInfo.usGa}`}
                    sx={{
                      ...chipStyle,
                      bgcolor: '#767676',
                    }}
                  />
                )}
                {dataInfo.usEdc && (
                  <Chip
                    label={`EDC ${reFormatDate(dataInfo.usEdc)}`}
                    sx={{
                      ...chipStyle,
                      bgcolor: '#767676',
                    }}
                  />
                )}
              </Typography>
            )}
          </Box>
          {!showEditForm && (
            <Box
              sx={{
                ...boxStyle,
                mt: 1.5,
                width: '100%',
                minWidth: 348,

                pr: 1,
              }}
            >
              <Divider />
              {/* {loadingMes && <LinearProgress sx={{ mt: 0.5 }} />} */}
              <SkeletonLoading loading={loadingMes} style={{ mt: 0.5 }} />
              <div style={{ display: loadingMes && 'none' }}>
                <Fade
                  in={!loadingMes && mesurement.length > 0 ? true : false}
                  timeout={400}
                >
                  <Box
                    sx={{
                      '& :hover': {
                        bgcolor: theme =>
                          MODE[theme.palette.mode].dataGrid.rowHover,
                      },
                    }}
                  >
                    {!loadingMes &&
                      mesurement.map((m, i) => {
                        if (!m.content) return
                        const con = m.content.split('#')
                        let c1 = m.content
                        let c2
                        if (con.length > 1) {
                          c1 = con[0]
                          c2 = (
                            <Chip
                              label={`GA ${con[1]}`}
                              sx={{
                                ...chipStyle,
                                pointerEvents: 'none',
                                // ml: -1,
                                bgcolor: theme =>
                                  theme.palette.mode === 'light'
                                    ? '#4D7198'
                                    : '#4d8498',
                              }}
                            />
                          )
                        }

                        return (
                          <div key={i}>
                            <Typography
                              component='div'
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                // my: 0.5,
                                py: 0.5,
                                pl: 1,
                              }}
                            >
                              <div
                                style={{
                                  minWidth: 95,
                                }}
                              >
                                {m.contentFreeValueName?.trim()
                                  ? m.contentFreeValueName
                                  : m.contentValueName}
                              </div>
                              <div
                                style={{
                                  minWidth: 60,
                                  textAlign: 'right',
                                  paddingRight: 3,
                                }}
                              >
                                {c1}
                              </div>
                              <Box
                                sx={{
                                  minWidth: 45,
                                  // border: '1px solid white',
                                  color: theme =>
                                    theme.palette.mode === 'dark'
                                      ? '#89CFF0'
                                      : 'blue',
                                }}
                              >
                                {m.contentFreeValueUnit?.trim()
                                  ? m.contentFreeValueUnit
                                  : m.contentUnit}
                              </Box>
                              <div
                                style={{
                                  minWidth: 120,
                                  paddingLeft: 5,
                                }}
                              >
                                {c2}
                              </div>
                            </Typography>
                            <Divider />
                          </div>
                        )
                      })}
                  </Box>
                </Fade>
              </div>
            </Box>
          )}
          {showEditForm && (
            <Box
              sx={{
                ...boxStyle,
                mt: 1.5,
                width: '100%',
                minWidth: 348,
                pr: 1,
              }}
            >
              <Divider />
              {dataForm.map(form => {
                let dataValue = dataFormSend[form.valueId].value
                let ga = ''
                if (dataValue && dataValue.indexOf('#') > -1) {
                  const split = dataValue.split('#')
                  dataValue = split[0]
                  ga = 'GA ' + split[1]
                }
                let formName = form.name
                let formUnit = form.unit
                if (form.type === 'F') {
                  formUnit = (
                    <TextField
                      autoComplete='off'
                      size='small'
                      sx={{ ...inputStyle, width: 50 }}
                      value={dataFormSend[form.valueId].freeUnit}
                      onChange={e => {
                        updateMesurementDataChange('1')
                        setDataFormSend(prev => {
                          let temp = {
                            ...prev,
                            [form.valueId]: {
                              ...prev[form.valueId],
                              freeUnit: e.target.value,
                            },
                          }

                          backupData = temp
                          storeBackupData5(temp)

                          return temp
                        })
                      }}
                      inputProps={{
                        style: {
                          padding: '3px 0px 3px 3px',
                          textAlign: 'left',
                          backgroundColor:
                            theme.palette.mode === 'light'
                              ? 'white'
                              : '#393939',
                        },
                      }}
                    />
                  )
                  formName = (
                    <TextField
                      autoComplete='off'
                      size='small'
                      sx={{ ...inputStyle, width: 105, ml: -1 }}
                      value={dataFormSend[form.valueId].freeName}
                      onChange={e => {
                        updateMesurementDataChange('1')
                        setDataFormSend(prev => {
                          let temp = {
                            ...prev,
                            [form.valueId]: {
                              ...prev[form.valueId],
                              freeName: e.target.value,
                            },
                          }

                          backupData = temp
                          storeBackupData5(temp)

                          return temp
                        })
                      }}
                      inputProps={{
                        style: {
                          padding: '3px 0px 3px 3px',
                          textAlign: 'left',
                          backgroundColor:
                            theme.palette.mode === 'light'
                              ? 'white'
                              : '#393939',
                        },
                      }}
                    />
                  )
                }
                return (
                  <Box
                    key={form.name}
                    sx={{
                      '& :hover': {
                        bgcolor: theme =>
                          MODE[theme.palette.mode].dataGrid.rowHover,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        pt: 0.5,
                        pb: 0.5,
                        pl: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 100,
                        }}
                      >
                        <div
                          title={
                            allowedAutoGa.includes(form.name)
                              ? 'Auto Generate GA'
                              : ''
                          }
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          {formName}&nbsp;
                          {allowedAutoGa.includes(form.name) && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: 20,
                                pointerEvents: 'none',
                                bgcolor: theme =>
                                  theme.palette.mode === 'dark'
                                    ? orange[200]
                                    : orange[500],
                              }}
                            ></Box>
                          )}
                        </div>
                      </Box>
                      <Box sx={{ width: 110, display: 'flex' }}>
                        <TextField
                          autoComplete='off'
                          size='small'
                          sx={{ ...inputStyle, width: 60 }}
                          value={dataValue}
                          onChange={e => {
                            const afiId = 22
                            const q1q4 = [23, 24, 25, 26]
                            let afi = 0
                            if (q1q4.includes(form.valueId)) {
                              const newarr = q1q4.filter(
                                e => e !== form.valueId
                              )
                              newarr.forEach(a => {
                                afi += parseFloat(dataFormSend[a].value) || 0
                              })
                              afi += parseFloat(e.target.value) || 0
                              afi = afi.toFixed(2)
                              if (afi === '0.00') afi = ''
                              if (afi.slice(-3) === '.00')
                                afi = afi.split('.')[0]

                              // console.log('afi', afi)
                            }

                            updateMesurementDataChange('1')
                            setDataFormSend(prev => {
                              let temp = {
                                ...prev,
                                [form.valueId]: {
                                  ...prev[form.valueId],
                                  value: e.target.value,
                                },
                                [afiId]: {
                                  ...prev[afiId],
                                  value: !afi ? '' : afi + '',
                                },
                              }
                              backupData = temp
                              storeBackupData5(temp)
                              return temp
                            })
                          }}
                          inputProps={{
                            style: {
                              padding: '3px 3px 3px 0',
                              textAlign: 'right',
                              backgroundColor:
                                theme.palette.mode === 'light'
                                  ? 'white'
                                  : '#393939',
                            },
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (allowedAutoGa.includes(form.name)) {
                                handleAutoGa(e, form)
                              }
                            }
                          }}
                        />
                        <Box
                          sx={{
                            width: 63,
                            ml: 0.5,
                            // border: '1px solid white',
                            color: theme =>
                              theme.palette.mode === 'dark'
                                ? 'lightblue'
                                : 'blue',
                          }}
                        >
                          {formUnit}
                        </Box>
                      </Box>

                      {ga && (
                        <Chip
                          label={ga}
                          sx={{
                            ...chipStyle,
                            pointerEvents: 'none',
                            // ml: -1,
                            bgcolor: theme =>
                              theme.palette.mode === 'light'
                                ? '#4D7198'
                                : '#4d8498',
                          }}
                        />
                      )}
                    </Box>
                    <Divider />
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      )}
      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default TwoDMesurements
